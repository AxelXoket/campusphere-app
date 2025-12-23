"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Map, { Marker, NavigationControl, MapRef } from "react-map-gl/mapbox";
import Supercluster from "supercluster";
import "mapbox-gl/dist/mapbox-gl.css";
import { mockUsers, MockUser } from "@/data/mockUsers";
import { mockEvents } from "@/data/mockEvents";
import { UserMarker } from "@/components/map/UserMarker";
import { EventMarker } from "@/components/map/EventMarker";
import { ClusterMarker } from "@/components/map/ClusterMarker";

// Istanbul center coordinates
const ISTANBUL_CENTER = {
    latitude: 41.0082,
    longitude: 28.9784,
    zoom: 12,
};

// Mapbox Dark style for the "Academic Heritage" dark map theme
const MAPBOX_STYLE = "mapbox://styles/mapbox/dark-v11";

// Debounce helper
function useDebouncedCallback<T extends (...args: unknown[]) => void>(
    callback: T,
    delay: number
): T {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    return useCallback(
        ((...args: unknown[]) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callback(...args);
            }, delay);
        }) as T,
        [callback, delay]
    );
}

interface MapViewProps {
    accessToken: string;
    onUserClick?: (userId: string) => void;
    onEventClick?: (eventId: string) => void;
    filteredUsers?: MockUser[];
    ghostModeUserId?: string;
}

// GeoJSON point type for clustering
interface UserPointProperties {
    cluster: false;
    user: MockUser;
}

type UserPoint = Supercluster.PointFeature<UserPointProperties>;

// Cluster settings constants
const CLUSTER_RADIUS = 40; // Smaller radius for less aggressive clustering
const CLUSTER_MAX_ZOOM = 16; // Disable clustering at zoom 16+
const DISABLE_CLUSTERING_ZOOM = 17; // Hard limit - show all markers

/**
 * Dark mode interactive map centered on Istanbul
 * Features: User clustering, event markers, dark tiles, filtering, ghost mode
 * Optimized: Debounced bounds, stable data, proper cluster settings
 */
export function MapView({
    accessToken,
    onUserClick,
    onEventClick,
    filteredUsers,
    ghostModeUserId
}: MapViewProps) {
    const mapRef = useRef<MapRef>(null);
    const [viewState, setViewState] = useState(ISTANBUL_CENTER);
    const [isLoaded, setIsLoaded] = useState(false);
    const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);

    // Use filtered users or all users - STABLE reference
    const usersToDisplay = useMemo(
        () => filteredUsers || mockUsers,
        [filteredUsers]
    );

    // Convert users to GeoJSON points for clustering - MEMOIZED
    const points: UserPoint[] = useMemo(() =>
        usersToDisplay
            .filter(user => user.id !== ghostModeUserId)
            .map((user) => ({
                type: "Feature" as const,
                properties: { cluster: false as const, user },
                geometry: {
                    type: "Point" as const,
                    coordinates: [user.longitude, user.latitude] as [number, number],
                },
            })),
        [usersToDisplay, ghostModeUserId]
    );

    // Create supercluster index - OPTIMIZED settings
    const supercluster = useMemo(() => {
        const index = new Supercluster<UserPointProperties>({
            radius: CLUSTER_RADIUS,
            maxZoom: CLUSTER_MAX_ZOOM,
            minPoints: 2, // Minimum 2 points to form a cluster
        });
        index.load(points);
        return index;
    }, [points]);

    // Get clusters for current viewport - with zoom-based disabling
    const clusters = useMemo(() => {
        if (!bounds) return points;

        // Disable clustering entirely at high zoom levels
        if (viewState.zoom >= DISABLE_CLUSTERING_ZOOM) {
            return points;
        }

        return supercluster.getClusters(bounds, Math.floor(viewState.zoom));
    }, [supercluster, bounds, viewState.zoom, points]);

    const handleMove = useCallback((evt: { viewState: typeof viewState }) => {
        setViewState(evt.viewState);
    }, []);

    // DEBOUNCED bounds update - prevents lag during pan/zoom
    const updateBoundsInternal = useCallback(() => {
        if (mapRef.current) {
            const map = mapRef.current.getMap();
            const mapBounds = map.getBounds();
            if (mapBounds) {
                setBounds([
                    mapBounds.getWest(),
                    mapBounds.getSouth(),
                    mapBounds.getEast(),
                    mapBounds.getNorth(),
                ]);
            }
        }
    }, []);

    const updateBounds = useDebouncedCallback(updateBoundsInternal, 150);

    // Immediate bounds update on load
    const handleLoad = useCallback(() => {
        updateBoundsInternal();
    }, [updateBoundsInternal]);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Handle cluster click - FLUID zoom with flyTo animation
    const handleClusterClick = useCallback((clusterId: number, longitude: number, latitude: number) => {
        const expansionZoom = Math.min(supercluster.getClusterExpansionZoom(clusterId), CLUSTER_MAX_ZOOM + 1);

        // Use Mapbox flyTo for smooth cinematic zoom
        if (mapRef.current) {
            mapRef.current.flyTo({
                center: [longitude, latitude],
                zoom: expansionZoom,
                duration: 1200,
                essential: true,
                easing: (t) => 1 - Math.pow(1 - t, 3),
            });
        }
    }, [supercluster]);

    return (
        <div className={`w-full h-full transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
            <Map
                ref={mapRef}
                {...viewState}
                onMove={handleMove}
                onMoveEnd={updateBounds}
                onLoad={handleLoad}
                mapStyle={MAPBOX_STYLE}
                mapboxAccessToken={accessToken}
                style={{ width: "100%", height: "100%" }}
                attributionControl={false}
            >
                <NavigationControl position="bottom-right" showCompass={false} />

                {/* User markers with clustering */}
                {clusters.map((cluster, index) => {
                    const [longitude, latitude] = cluster.geometry.coordinates;

                    // Check if it's a cluster
                    if ("cluster" in cluster.properties && cluster.properties.cluster === true) {
                        const clusterProps = cluster.properties as Supercluster.ClusterProperties;
                        const pointCount = clusterProps.point_count;
                        const clusterId = cluster.id as number;

                        return (
                            <Marker
                                key={`cluster-${clusterId}`}
                                latitude={latitude}
                                longitude={longitude}
                                anchor="center"
                            >
                                <ClusterMarker
                                    count={pointCount}
                                    onClick={() => handleClusterClick(clusterId, longitude, latitude)}
                                />
                            </Marker>
                        );
                    }

                    // Individual user marker - higher z-index for clickability
                    const userProps = cluster.properties as UserPointProperties;
                    const user = userProps.user;
                    return (
                        <Marker
                            key={`user-${user.id}`}
                            latitude={latitude}
                            longitude={longitude}
                            anchor="center"
                            style={{ zIndex: 10 }} // Higher z-index for individual markers
                        >
                            <UserMarker user={user} onClick={() => onUserClick?.(user.id)} />
                        </Marker>
                    );
                })}

                {/* Event markers (not clustered) - highest z-index */}
                {mockEvents.map((event) => (
                    <Marker
                        key={event.id}
                        latitude={event.latitude}
                        longitude={event.longitude}
                        anchor="center"
                        style={{ zIndex: 20 }} // Highest z-index for events
                    >
                        <EventMarker event={event} onClick={() => onEventClick?.(event.id)} />
                    </Marker>
                ))}
            </Map>
        </div>
    );
}
