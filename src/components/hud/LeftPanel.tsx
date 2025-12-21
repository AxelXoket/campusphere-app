"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cloud, Calendar, Plus, X, MessageCircle } from "lucide-react";
import { mockEvents, MockEvent } from "@/data/mockEvents";
import { RoleType } from "@/components/auth";
import { ChatPanel } from "./ChatPanel";

interface LeftPanelProps {
    userRole: RoleType;
    onEventClick: (event: MockEvent) => void;
}

type ViewMode = "events" | "chat";

/**
 * Left Panel - Glassmorphism sidebar
 * Contains Events list and Chat interface
 * Tabbed navigation between views
 */
export function LeftPanel({ userRole, onEventClick }: LeftPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("events");

    // Only Mezun and Akademisyen can create events
    const canCreateEvent = userRole === "mezun" || userRole === "akademisyen";

    // Mock unread message count
    const unreadMessages = 3;

    return (
        <>
            {/* Toggle Button with notification badge */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setIsOpen(true)}
                className="absolute top-4 left-4 z-20 w-12 h-12 flex items-center justify-center backdrop-blur-md bg-black/60 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
                title="Mesajlar ve Etkinlikler"
            >
                <Cloud className="w-5 h-5 text-white" />
                {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--warm-gold)] text-black text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadMessages}
                    </span>
                )}
            </motion.button>

            {/* Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
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
                                    onClick={() => setIsOpen(false)}
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
                                                        setIsOpen(false);
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
            className={`flex-1 flex items-center justify-center gap-2 py-4 transition-colors relative ${isActive ? "text-white bg-white/5" : "text-white/50 hover:text-white/80"
                }`}
        >
            <Icon className="w-4 h-4" />
            <span className="text-sm">{label}</span>
            {badge && badge > 0 && (
                <span className="w-4 h-4 bg-[var(--warm-gold)] text-black text-xs font-bold rounded-full flex items-center justify-center">
                    {badge}
                </span>
            )}
            {isActive && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--bosphorus-emerald)]"
                />
            )}
        </button>
    );
}

/**
 * Event Card Component
 * Image + Title + Date layout
 */
function EventCard({ event, onClick }: { event: MockEvent; onClick: () => void }) {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="w-full text-left bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-[var(--warm-gold)]/50 transition-colors"
        >
            {/* Event Image */}
            {event.imageUrl && (
                <div className="h-32 w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Event Info */}
            <div className="p-4">
                <h3 className="text-white font-medium mb-1 line-clamp-1">{event.title}</h3>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(event.date)}</span>
                    <span>•</span>
                    <span>{event.time}</span>
                </div>
                <p className="text-white/40 text-xs mt-2 line-clamp-2">{event.location}</p>
            </div>
        </motion.button>
    );
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}
