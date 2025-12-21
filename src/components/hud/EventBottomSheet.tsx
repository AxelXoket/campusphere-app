"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, MapPin, Calendar, Clock, Users } from "lucide-react";
import { MockEvent } from "@/data/mockEvents";

interface EventBottomSheetProps {
    event: MockEvent | null;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Bottom Sheet for event details
 * Slides up from bottom with Motion
 * Glassmorphism styling
 */
export function EventBottomSheet({ event, isOpen, onClose }: EventBottomSheetProps) {
    if (!event) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 z-40"
                    />

                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/80 border-t border-white/10 rounded-t-3xl max-h-[70vh] overflow-hidden"
                    >
                        {/* Handle Bar */}
                        <div className="flex justify-center py-3">
                            <div className="w-12 h-1 bg-white/30 rounded-full" />
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <X className="w-5 h-5 text-white/70" />
                        </button>

                        {/* Content */}
                        <div className="px-6 pb-8 overflow-y-auto max-h-[calc(70vh-60px)]">
                            {/* Event Image */}
                            {event.imageUrl && (
                                <div className="h-48 w-full rounded-xl overflow-hidden mb-5">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={event.imageUrl}
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Title */}
                            <h2
                                className="text-2xl text-white mb-4"
                                style={{ fontFamily: "var(--font-heading)" }}
                            >
                                {event.title}
                            </h2>

                            {/* Meta Info */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <MetaItem icon={Calendar} label={formatDate(event.date)} />
                                <MetaItem icon={Clock} label={event.time} />
                                <MetaItem icon={MapPin} label={event.location} />
                                <MetaItem icon={Users} label={`${event.attendeeCount} Katılımcı`} />
                            </div>

                            {/* Description */}
                            <p className="text-white/70 mb-6">{event.description}</p>

                            {/* Organizer */}
                            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 mb-6">
                                <div className="w-10 h-10 rounded-full bg-[var(--bosphorus-emerald)] flex items-center justify-center text-white font-medium">
                                    {event.organizer[0]}
                                </div>
                                <div>
                                    <p className="text-white font-medium">{event.organizer}</p>
                                    <p className="text-white/50 text-sm capitalize">
                                        {event.organizerRole === "mezun" ? "Mezun" : "Akademisyen"}
                                    </p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button className="w-full py-4 bg-[var(--bosphorus-emerald)] text-white font-medium rounded-xl hover:bg-[var(--bosphorus-emerald-light)] transition-colors">
                                Katıl
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function MetaItem({ icon: Icon, label }: { icon: typeof Calendar; label: string }) {
    return (
        <div className="flex items-center gap-2 text-white/60">
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm truncate">{label}</span>
        </div>
    );
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}
