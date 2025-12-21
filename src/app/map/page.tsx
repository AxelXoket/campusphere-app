"use client";

import { useState, useCallback, useMemo } from "react";
import { MapView } from "@/components/map";
import {
    SearchBar,
    ProfileButton,
    ProfileDrawer,
    ToolDock,
    LeftPanel,
    EventBottomSheet,
    UserBottomSheet,
    FilterOverlay,
    LayersOverlay
} from "@/components/hud";
import { mockEvents, MockEvent } from "@/data/mockEvents";
import { mockUsers, MockUser } from "@/data/mockUsers";
import { RoleType } from "@/components/auth";

// Mock current user data - can be changed to test role-based features
const currentUser = {
    id: "1",
    name: "Ahmet Yılmaz",
    email: "ahmet.yilmaz@istanbul.edu.tr",
    role: "ogrenci" as RoleType, // Change to "mezun" or "akademisyen" to see "Etkinlik Oluştur" button
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmet",
    displayRole: "Öğrenci",
    department: "Bilgisayar Mühendisliği",
    faculty: "Mühendislik Fakültesi",
    year: "3. Sınıf",
};

// Mapbox token from environment
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/**
 * Main map page - The heart of CampuSphere
 * Dark mode map with user bubbles, events, and floating HUD
 * Phase 6: Map tools expansion, layers overlay
 */
export default function MapPage() {
    // UI State
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isLayersOpen, setIsLayersOpen] = useState(false);

    // Event Sheet
    const [selectedEvent, setSelectedEvent] = useState<MockEvent | null>(null);
    const [isEventSheetOpen, setIsEventSheetOpen] = useState(false);

    // User Sheet
    const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
    const [isUserSheetOpen, setIsUserSheetOpen] = useState(false);

    // Ghost Mode
    const [isGhostMode, setIsGhostMode] = useState(false);

    // Filters - all enabled by default
    const [filters, setFilters] = useState<Record<RoleType, boolean>>({
        ogrenci: true,
        mezun: true,
        akademisyen: true,
    });

    // Handle filter changes
    const handleFilterChange = useCallback((role: RoleType, enabled: boolean) => {
        setFilters(prev => ({ ...prev, [role]: enabled }));
    }, []);

    // Filter users based on current filter state
    const filteredUsers = useMemo(() => {
        return mockUsers.filter(user => filters[user.role]);
    }, [filters]);

    // Handle user marker click - open bottom sheet
    const handleUserClick = useCallback((userId: string) => {
        const user = mockUsers.find(u => u.id === userId);
        if (user) {
            setSelectedUser(user);
            setIsUserSheetOpen(true);
        }
    }, []);

    // Handle event marker click
    const handleEventClick = useCallback((eventId: string) => {
        const event = mockEvents.find(e => e.id === eventId);
        if (event) {
            setSelectedEvent(event);
            setIsEventSheetOpen(true);
        }
    }, []);

    // Handle event from left panel
    const handleEventFromPanel = useCallback((event: MockEvent) => {
        setSelectedEvent(event);
        setIsEventSheetOpen(true);
    }, []);

    return (
        <main className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a]">
            {/* Map Layer - passes filtered users */}
            <MapView
                accessToken={MAPBOX_TOKEN}
                onUserClick={handleUserClick}
                onEventClick={handleEventClick}
                filteredUsers={filteredUsers}
                ghostModeUserId={isGhostMode ? currentUser.id : undefined}
            />

            {/* HUD Overlay */}
            <SearchBar />

            {/* Left Panel - Chat & Events */}
            <LeftPanel
                userRole={currentUser.role}
                onEventClick={handleEventFromPanel}
            />

            {/* Ghost Mode status indicator on map */}
            {isGhostMode && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 backdrop-blur-md bg-[var(--warm-gold)]/20 border border-[var(--warm-gold)]/30 rounded-full flex items-center gap-2">
                    <span className="w-2 h-2 bg-[var(--warm-gold)] rounded-full animate-pulse" />
                    <span className="text-[var(--warm-gold)] text-sm font-medium">Hayalet Modu Aktif</span>
                </div>
            )}

            <ProfileButton
                avatar={currentUser.avatar}
                onClick={() => setIsProfileOpen(true)}
                isGhostMode={isGhostMode}
            />

            <ToolDock
                onFilterClick={() => setIsFilterOpen(true)}
                onLayersClick={() => setIsLayersOpen(true)}
            />

            {/* Profile Drawer with detailed info and Ghost Mode control */}
            <ProfileDrawer
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={{
                    name: currentUser.name,
                    email: currentUser.email,
                    role: currentUser.displayRole,
                    avatar: currentUser.avatar,
                }}
                isGhostMode={isGhostMode}
                onGhostModeChange={setIsGhostMode}
            />

            {/* Filter Overlay */}
            <FilterOverlay
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                onFilterChange={handleFilterChange}
            />

            {/* Layers Overlay */}
            <LayersOverlay
                isOpen={isLayersOpen}
                onClose={() => setIsLayersOpen(false)}
            />

            {/* Event Bottom Sheet */}
            <EventBottomSheet
                event={selectedEvent}
                isOpen={isEventSheetOpen}
                onClose={() => setIsEventSheetOpen(false)}
            />

            {/* User Bottom Sheet */}
            <UserBottomSheet
                user={selectedUser}
                isOpen={isUserSheetOpen}
                onClose={() => setIsUserSheetOpen(false)}
            />
        </main>
    );
}
