"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cloud, Calendar, Plus, X, MessageCircle } from "lucide-react";
import { mockEvents, MockEvent } from "@/data/mockEvents";
import { RoleType } from "@/components/auth";
import { ChatPanel } from "./ChatPanel";

interface LeftPanelProps {
    userRole: RoleType;
    onEventClick: (event: MockEvent) => void;
    // External control props
    isOpen?: boolean;
    onOpen?: () => void;  // Called when toggle button is clicked
    onClose?: () => void;
    initialView?: "events" | "chat";
    activeChannelId?: string | null;
    onOpenProfile?: (userId: string) => void;
}

type ViewMode = "events" | "chat";

/**
 * Left Panel - Glassmorphism sidebar
 * Contains Events list and Chat interface
 * Tabbed navigation between views
 * Supports external control for chat navigation
 */
export function LeftPanel({
    userRole,
    onEventClick,
    isOpen: externalIsOpen,
    onOpen: externalOnOpen,
    onClose: externalOnClose,
    initialView,
    activeChannelId,
    onOpenProfile,
}: LeftPanelProps) {
    // Use external control if provided, otherwise use internal state
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("events");

    // Determine if panel is open (external or internal control)
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

    // Handle close
    const handleClose = () => {
        if (externalOnClose) {
            externalOnClose();
        } else {
            setInternalIsOpen(false);
        }
    };

    // Handle toggle (for internal button)
    const handleToggle = () => {
        if (externalOnClose) {
            // If externally controlled, trigger external handler
            externalOnClose();
        } else {
            setInternalIsOpen(true);
        }
    };

    // Sync view mode when initialView changes (for external navigation to chat)
    useEffect(() => {
        if (initialView) {
            setViewMode(initialView);
        }
    }, [initialView]);

    // When activeChannelId is set, switch to chat view
    useEffect(() => {
        if (activeChannelId && isOpen) {
            setViewMode("chat");
        }
    }, [activeChannelId, isOpen]);

    // Only Mezun and Akademisyen can create events
    const canCreateEvent = userRole === "mezun" || userRole === "akademisyen";

    // Mock unread message count
    const unreadMessages = 3;

    return (
        <>
            {/* Toggle Button - Hidden when panel is open */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onClick={() => {
                            if (externalOnOpen) {
                                externalOnOpen();
                            } else {
                                setInternalIsOpen(true);
                            }
                        }}
                        className="absolute top-4 left-4 z-50 w-12 h-12 flex items-center justify-center backdrop-blur-md bg-black/60 rounded-full border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                        style={{ pointerEvents: 'auto' }}
                        title="Mesajlar ve Etkinlikler"
                    >
                        <Cloud className="w-5 h-5 text-white" />
                        {unreadMessages > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--warm-gold)] text-black text-xs font-bold rounded-full flex items-center justify-center">
                                {unreadMessages}
                            </span>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClose}
                            className="fixed inset-0 bg-black/30 z-30"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed top-0 left-0 h-full w-80 z-40 backdrop-blur-xl bg-black/70 border-r border-white/10 flex flex-col"
                        >
                            {/* Tabs */}
                            <div className="flex border-b border-white/10">
                                <TabButton
                                    isActive={viewMode === "events"}
                                    onClick={() => setViewMode("events")}
                                    icon={Calendar}
                                    label="Etkinlikler"
                                />
                                <TabButton
                                    isActive={viewMode === "chat"}
                                    onClick={() => setViewMode("chat")}
                                    icon={MessageCircle}
                                    label="Mesajlar"
                                    badge={unreadMessages}
                                />
                                <button
                                    onClick={handleClose}
                                    className="w-12 flex items-center justify-center hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5 text-white/70" />
                                </button>
                            </div>

                            {/* Content */}
                            <AnimatePresence mode="wait">
                                {viewMode === "events" ? (
                                    <motion.div
                                        key="events"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex-1 flex flex-col"
                                    >
                                        {/* Events List */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                            {mockEvents.map((event) => (
                                                <EventCard
                                                    key={event.id}
                                                    event={event}
                                                    onClick={() => {
                                                        onEventClick(event);
                                                        handleClose();
                                                    }}
                                                />
                                            ))}
                                        </div>

                                        {/* Create Event Button (Role-based) */}
                                        {canCreateEvent && (
                                            <div className="p-4 border-t border-white/10">
                                                <button className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--warm-gold)] text-black font-medium rounded-xl hover:bg-[var(--warm-gold-muted)] transition-colors">
                                                    <Plus className="w-5 h-5" />
                                                    Etkinlik Oluştur
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="chat"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex-1"
                                    >
                                        <ChatPanel
                                            isOpen={true}
                                            onBack={() => setViewMode("events")}
                                            activeChannelId={activeChannelId}
                                            onOpenProfile={onOpenProfile}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

function TabButton({
    isActive,
    onClick,
    icon: Icon,
    label,
    badge,
}: {
    isActive: boolean;
    onClick: () => void;
    icon: typeof Calendar;
    label: string;
    badge?: number;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors relative ${isActive
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white/80 hover:bg-white/5"
                }`}
        >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
            {badge && badge > 0 && (
                <span className="absolute top-1.5 right-3 w-4 h-4 bg-[var(--warm-gold)] text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                    {badge}
                </span>
            )}
        </button>
    );
}

function EventCard({
    event,
    onClick,
}: {
    event: MockEvent;
    onClick: () => void;
}) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full text-left p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-[var(--warm-gold)]/50 transition-colors"
        >
            {event.imageUrl && (
                <div className="w-full aspect-video rounded-lg overflow-hidden mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            <h3
                className="text-white font-medium mb-1 line-clamp-1"
                style={{ fontFamily: "var(--font-heading)" }}
            >
                {event.title}
            </h3>
            <p className="text-white/50 text-sm line-clamp-1">{event.location}</p>
            <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-[var(--warm-gold)]">
                    {new Date(event.date).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                    })}
                </span>
                <span className="text-xs text-white/40">
                    {event.attendeeCount} katılımcı
                </span>
            </div>
        </motion.button>
    );
}
