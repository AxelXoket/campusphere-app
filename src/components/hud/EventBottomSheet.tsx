"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, MapPin, Calendar, Clock, Users, Lock, Unlock, MessageCircle } from "lucide-react";
import { MockEvent } from "@/data/mockEvents";
import { addUserChannel } from "@/data/mockMessages";
import {
    getParticipation,
    requestJoin,
    approveJoin,
    ParticipationStatus,
    getEventChatChannelId,
} from "@/stores/participationStore";

interface EventBottomSheetProps {
    event: MockEvent | null;
    isOpen: boolean;
    onClose: () => void;
    onChatOpen?: (channelId: string) => void;
    currentUserId?: string;
    onToast?: (type: "success" | "error" | "info", message: string) => void;
}

// Helper to get high-quality image URL
function getHighQualityImageUrl(url: string): string {
    if (!url) return url;
    if (url.includes("unsplash.com")) {
        const separator = url.includes("?") ? "&" : "?";
        return `${url}${separator}q=80&w=1200&auto=format&fit=crop`;
    }
    return url;
}

/**
 * Centered Floating Modal for event details
 * Uses participationStore for event-scoped approval logic
 */
export function EventBottomSheet({
    event,
    isOpen,
    onClose,
    onChatOpen,
    currentUserId = "current-user",
    onToast,
}: EventBottomSheetProps) {
    // Local state tracking for participation status
    const [joinStatus, setJoinStatus] = useState<ParticipationStatus | "not_joined">("not_joined");
    const [isLoading, setIsLoading] = useState(false);

    // Load participation status when event changes - STRICT eventId check
    useEffect(() => {
        if (event && currentUserId) {
            const participation = getParticipation(event.id, currentUserId);
            setJoinStatus(participation?.status || "not_joined");
        } else {
            setJoinStatus("not_joined");
        }
    }, [event, currentUserId, isOpen]);

    if (!event) return null;

    // Handle join request - creates event-specific participation
    const handleJoinRequest = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create participation with strict eventId binding
        requestJoin(event.id, currentUserId);
        setJoinStatus("pending");
        setIsLoading(false);

        onToast?.("info", "Katılım isteği gönderildi. Onay bekleniyor...");
    };

    // Handle chat navigation - validates approval for THIS event only
    const handleChatOpen = () => {
        // STRICT CHECK: Get channel ID only if approved for THIS specific event
        const channelId = getEventChatChannelId(event.id, currentUserId);

        if (channelId && onChatOpen) {
            // Close modal FIRST, then navigate
            onClose();
            // Small delay to allow modal close animation
            setTimeout(() => {
                onChatOpen(channelId);
            }, 150);
        } else {
            onToast?.("error", "Sohbet erişimi bulunamadı");
        }
    };

    // Demo: Approve (simulates organizer action with auto-channel creation)
    const handleDemoApprove = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        // Approve with auto-channel linking - STRICT eventId
        const channelId = `channel-${event.id}`;
        approveJoin(event.id, currentUserId, channelId);

        // SYNC: Add channel to user's visible channels list
        addUserChannel(channelId);

        setJoinStatus("approved");
        setIsLoading(false);

        onToast?.("success", "Kullanıcı onayı başarılı. Sohbet erişimi açıldı.");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40"
                    />

                    {/* Centered Floating Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{
                            type: "spring",
                            damping: 30,
                            stiffness: 400,
                        }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-xl"
                    >
                        {/* Panel with Dark Glassmorphism */}
                        <div className="relative backdrop-blur-xl bg-black/90 border border-white/10 rounded-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl shadow-black/60">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-colors z-20"
                                aria-label="Kapat"
                            >
                                <X className="w-5 h-5 text-white/80" />
                            </button>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto">
                                {/* Event Image */}
                                {event.imageUrl && (
                                    <div className="aspect-video w-full overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={getHighQualityImageUrl(event.imageUrl)}
                                            alt={event.title}
                                            className="w-full h-full object-cover"
                                            loading="eager"
                                        />
                                    </div>
                                )}

                                {/* Content Body */}
                                <div className="px-6 py-5 pb-28">
                                    {/* Title */}
                                    <h2
                                        className="text-xl font-bold text-white mb-4"
                                        style={{ fontFamily: "var(--font-heading)" }}
                                    >
                                        {event.title}
                                    </h2>

                                    {/* Meta Info Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-5">
                                        <MetaItem icon={Calendar} label={formatDate(event.date)} />
                                        <MetaItem icon={Clock} label={event.time} />
                                        <MetaItem icon={MapPin} label={event.location} />
                                        <MetaItem icon={Users} label={`${event.attendeeCount} Katılımcı`} />
                                    </div>

                                    {/* Gated Chat Indicator - Shows status for THIS event only */}
                                    <div className={`flex items-center gap-3 p-3 rounded-xl border mb-5 transition-colors ${joinStatus === "approved"
                                        ? "bg-[var(--bosphorus-emerald)]/10 border-[var(--bosphorus-emerald)]/30"
                                        : "bg-white/5 border-white/10"
                                        }`}>
                                        {joinStatus === "approved" ? (
                                            <Unlock className="w-5 h-5 text-[var(--bosphorus-emerald)]" />
                                        ) : (
                                            <Lock className="w-5 h-5 text-white/40" />
                                        )}
                                        <span className={`text-sm ${joinStatus === "approved" ? "text-[var(--bosphorus-emerald)]" : "text-white/50"
                                            }`}>
                                            Katılımcılara Özel Sohbet Grubu
                                        </span>
                                        {joinStatus === "approved" && (
                                            <span className="ml-auto text-xs text-[var(--bosphorus-emerald)] font-medium">
                                                Erişim Açık
                                            </span>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <p className="text-white/70 text-sm leading-relaxed mb-5">
                                        {event.description}
                                    </p>

                                    {/* Organizer Card */}
                                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                        <div className="w-10 h-10 rounded-full bg-[var(--bosphorus-emerald)] flex items-center justify-center text-white font-semibold">
                                            {event.organizer[0]}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-sm">{event.organizer}</p>
                                            <p className="text-white/50 text-xs capitalize">
                                                {event.organizerRole === "mezun" ? "Mezun" : "Akademisyen"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Demo Approval Button */}
                                    {joinStatus === "pending" && (
                                        <button
                                            onClick={handleDemoApprove}
                                            disabled={isLoading}
                                            className="mt-4 w-full py-2 text-xs text-amber-500/70 hover:text-amber-500 border border-amber-500/30 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {isLoading ? "Onaylanıyor..." : "[Demo] Organizatör Olarak Onayla"}
                                        </button>
                                    )}

                                    {/* Event ID indicator (debug) */}
                                    <p className="mt-4 text-xs text-white/20 text-center">
                                        Etkinlik ID: {event.id}
                                    </p>
                                </div>
                            </div>

                            {/* Pinned Action Bar */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent">
                                <ActionButton
                                    status={joinStatus}
                                    isLoading={isLoading}
                                    onJoin={handleJoinRequest}
                                    onChat={handleChatOpen}
                                />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Dynamic Action Button Component
function ActionButton({
    status,
    isLoading,
    onJoin,
    onChat,
}: {
    status: ParticipationStatus | "not_joined";
    isLoading: boolean;
    onJoin: () => void;
    onChat: () => void;
}) {
    switch (status) {
        case "not_joined":
            return (
                <button
                    onClick={onJoin}
                    disabled={isLoading}
                    className="w-full py-3.5 bg-[var(--bosphorus-emerald)] text-white font-semibold rounded-xl hover:bg-[var(--bosphorus-emerald-light)] transition-colors shadow-lg shadow-[var(--bosphorus-emerald)]/30 disabled:opacity-50"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <motion.span
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            Gönderiliyor...
                        </span>
                    ) : (
                        "Katıl"
                    )}
                </button>
            );

        case "pending":
            return (
                <div className="relative group">
                    <button
                        disabled
                        className="w-full py-3.5 border-2 border-amber-500/50 text-amber-500 font-semibold rounded-xl cursor-not-allowed opacity-80"
                    >
                        Onay Bekleniyor...
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white/80 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Etkinlik sahibi onayladığında bildirilecektir.
                    </div>
                </div>
            );

        case "approved":
            return (
                <button
                    onClick={onChat}
                    className="w-full py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                >
                    <MessageCircle className="w-5 h-5" />
                    Sohbet Grubuna Git
                </button>
            );

        case "rejected":
            return (
                <button
                    disabled
                    className="w-full py-3.5 border-2 border-red-500/50 text-red-500 font-semibold rounded-xl cursor-not-allowed opacity-80"
                >
                    Katılım Reddedildi
                </button>
            );
    }
}

function MetaItem({ icon: Icon, label }: { icon: typeof Calendar; label: string }) {
    return (
        <div className="flex items-center gap-2 text-gray-400">
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm truncate">{label}</span>
        </div>
    );
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}
