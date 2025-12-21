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

/**
 * Dark mode interactive map centered on Istanbul
 * Features: User clustering, event markers, dark tiles, filtering, ghost mode
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

    // Use filtered users or all users
    const usersToDisplay = filteredUsers || mockUsers;

    // Convert users to GeoJSON points for clustering
    const points: UserPoint[] = useMemo(() =>
        usersToDisplay
            .filter(user => user.id !== ghostModeUserId) // Hide user's own marker in ghost mode
            .map((user) => ({
                type: "Feature" as const,
                properties: { cluster: false as const, user },
                geometry: {
                    type: "Point" as const,
                    coordinates: [user.longitude, user.latitude] as [number, number],
                },
            })),
        [usersToDisplay, ghostModeUserId]);

    // Create supercluster index
    const supercluster = useMemo(() => {
        const index = new Supercluster<UserPointProperties>({
            radius: 60,
            maxZoom: 16,
        });
        index.load(points);
        return index;
    }, [points]);

    // Get clusters for current viewport
    const clusters = useMemo(() => {
        if (!bounds) return points;
        return supercluster.getClusters(bounds, Math.floor(viewState.zoom));
    }, [supercluster, bounds, viewState.zoom, points]);

    const handleMove = useCallback((evt: { viewState: typeof viewState }) => {
        setViewState(evt.viewState);
    }, []);

    // Update bounds when map loads or moves
    const updateBounds = useCallback(() => {
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

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Handle cluster click - FLUID zoom with flyTo animation
    const handleClusterClick = useCallback((clusterId: number, longitude: number, latitude: number) => {
        const expansionZoom = Math.min(supercluster.getClusterExpansionZoom(clusterId), 16);

        // Use Mapbox flyTo for smooth cinematic zoom
        if (mapRef.current) {
            mapRef.current.flyTo({
                center: [longitude, latitude],
                zoom: expansionZoom,
                duration: 1200, // 1.2 second animation
                essential: true,
                easing: (t) => 1 - Math.pow(1 - t, 3), // Cubic ease-out for smooth deceleration
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
                onLoad={updateBounds}
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

                    // Individual user marker
                    const userProps = cluster.properties as UserPointProperties;
                    const user = userProps.user;
                    return (
                        <Marker
                            key={`user-${user.id}-${index}`}
                            latitude={latitude}
                            longitude={longitude}
                            anchor="center"
                        >
                            <UserMarker user={user} onClick={() => onUserClick?.(user.id)} />
                        </Marker>
                    );
                })}

                {/* Event markers (not clustered) */}
                {mockEvents.map((event) => (
                    <Marker
                        key={event.id}
                        latitude={event.latitude}
                        longitude={event.longitude}
                        anchor="center"
                    >
                        <EventMarker event={event} onClick={() => onEventClick?.(event.id)} />
                    </Marker>
                ))}
            </Map>
        </div>
    );
}
