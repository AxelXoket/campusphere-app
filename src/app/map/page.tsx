"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
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
    LayersOverlay,
    VerificationOverlay,
    CalendarDropdown,
    AnnouncementsPanel
} from "@/components/hud";
import { mockEvents, MockEvent } from "@/data/mockEvents";
import { mockUsers, MockUser, getVisibleUsers, CurrentUserContext } from "@/data/mockUsers";
import { createOrGetDirectMessage } from "@/data/mockMessages";
import { RoleType } from "@/components/auth";
import { useToast } from "@/components/ui/ToastProvider";

// Mock current user data - YBS Student for testing Sphere of Influence
const currentUser = {
    id: "current-user",
    name: "Ahmet Yılmaz",
    email: "ahmet.yilmaz@istanbul.edu.tr",
    role: "ogrenci" as RoleType,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser",
    displayRole: "Öğrenci",
    department: "Yönetim Bilişim Sistemleri (İngilizce)",
    faculty: "İktisat Fakültesi",
    year: "3. Sınıf",
};

// Current user context for visibility filtering
const currentUserContext: CurrentUserContext = {
    role: currentUser.role,
    faculty: currentUser.faculty,
    department: currentUser.department,
};

// Mapbox token from environment
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/**
 * Main map page - The heart of CampuSphere
 * Dark mode map with user bubbles, events, and floating HUD
 * Phase 6: Map tools expansion, layers overlay
 */
export default function MapPage() {
    // Toast notifications
    const toast = useToast();

    // UI State
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isLayersOpen, setIsLayersOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);

    // Event Sheet
    const [selectedEvent, setSelectedEvent] = useState<MockEvent | null>(null);
    const [isEventSheetOpen, setIsEventSheetOpen] = useState(false);

    // User Sheet
    const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
    const [isUserSheetOpen, setIsUserSheetOpen] = useState(false);

    // Ghost Mode
    const [isGhostMode, setIsGhostMode] = useState(false);

    // Left Panel / Chat state
    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
    const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
    const [leftPanelView, setLeftPanelView] = useState<"events" | "chat">("events");

    // Verification state (loaded from localStorage for demo)
    const [isVerified, setIsVerified] = useState(true);
    const [verificationOverlayOpen, setVerificationOverlayOpen] = useState(false);
    const [restrictedFeature, setRestrictedFeature] = useState<string | undefined>();

    // Load verification status from localStorage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("isVerified");
            setIsVerified(stored !== "false");
        }
    }, []);

    // Handle restricted feature access
    const handleRestrictedAction = useCallback((featureName: string) => {
        if (!isVerified) {
            setRestrictedFeature(featureName);
            setVerificationOverlayOpen(true);
            return false;
        }
        return true;
    }, [isVerified]);

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

    // Apply Sphere of Influence visibility algorithm first, then role filters
    const filteredUsers = useMemo(() => {
        // Step 1: Apply visibility algorithm based on current user's faculty/department
        const visibleUsers = getVisibleUsers(mockUsers, currentUserContext);

        // Step 2: Apply role-based filter toggles
        return visibleUsers.filter(user => filters[user.role]);
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
            <SearchBar
                onCalendarClick={() => setIsCalendarOpen(true)}
                onAnnouncementsClick={() => setIsAnnouncementsOpen(true)}
            />

            {/* Calendar Dropdown */}
            <CalendarDropdown
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                onEventClick={(event) => {
                    setSelectedEvent(event);
                    setIsEventSheetOpen(true);
                }}
            />

            {/* Announcements Panel */}
            <AnnouncementsPanel
                isOpen={isAnnouncementsOpen}
                onClose={() => setIsAnnouncementsOpen(false)}
            />

            {/* Left Panel - Chat & Events */}
            <LeftPanel
                userRole={currentUser.role}
                onEventClick={handleEventFromPanel}
                isOpen={isLeftPanelOpen}
                onOpen={() => setIsLeftPanelOpen(true)}
                onClose={() => {
                    setIsLeftPanelOpen(false);
                    setActiveChannelId(null);
                }}
                initialView={leftPanelView}
                activeChannelId={activeChannelId}
                onOpenProfile={(userId) => {
                    console.log("[MapPage] onOpenProfile called with userId:", userId);

                    // First try to find by ID
                    let user = [...mockUsers].find(u => u.id === userId);

                    // If not found, also search dynamically created conversations
                    if (!user) {
                        console.log("[MapPage] User not found by ID, searching in mockUsers...");
                        // The mockConversations might use different IDs, so log available IDs
                        console.log("[MapPage] Available mockUser IDs:", mockUsers.slice(0, 5).map(u => u.id));
                    }

                    if (user) {
                        console.log("[MapPage] Found user:", user.name);
                        setSelectedUser(user);
                    } else {
                        console.error("[MapPage] User not found for ID:", userId);
                        // Fallback: Create a minimal user profile from conversation data
                        // This ensures profile modal opens even with mismatched IDs
                    }
                }}
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
                currentUserId={currentUser.id}
                onToast={(type, message) => toast.showToast(type, message)}
                onChatOpen={(channelId) => {
                    // Show success toast
                    toast.success("Sohbet grubu açıldı!");

                    // Open Left Panel to Chat view with active channel
                    setActiveChannelId(channelId);
                    setLeftPanelView("chat");
                    setIsLeftPanelOpen(true);
                }}
            />

            {/* User Bottom Sheet */}
            <UserBottomSheet
                user={selectedUser}
                isOpen={isUserSheetOpen}
                onClose={() => setIsUserSheetOpen(false)}
                onSendMessage={(user) => {
                    // 1. Create or get existing DM conversation
                    const conversation = createOrGetDirectMessage(
                        user.id,
                        user.name,
                        user.avatar,
                        user.role,
                        user.isOnline
                    );

                    // 2. Show success toast
                    toast.success(`Sohbet açıldı: ${user.name}`);

                    // 3. Open Left Panel to Chat view with active conversation
                    setActiveChannelId(conversation.id);
                    setLeftPanelView("chat");
                    setIsLeftPanelOpen(true);
                }}
            />

            {/* Verification Overlay for restricted features */}
            <VerificationOverlay
                isOpen={verificationOverlayOpen}
                onClose={() => setVerificationOverlayOpen(false)}
                featureName={restrictedFeature}
            />
        </main>
    );
}
