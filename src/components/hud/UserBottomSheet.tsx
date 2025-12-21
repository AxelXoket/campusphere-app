"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, MessageCircle } from "lucide-react";
import { MockUser } from "@/data/mockUsers";
import { RoleType } from "@/components/auth";

interface UserBottomSheetProps {
    user: MockUser | null;
    isOpen: boolean;
    onClose: () => void;
}

// Role display names in Turkish
const roleLabels: Record<RoleType, string> = {
    ogrenci: "Öğrenci",
    mezun: "Mezun",
    akademisyen: "Akademisyen",
};

// Role border colors matching UserMarker
const roleBorderColors: Record<RoleType, string> = {
    ogrenci: "border-white",
    mezun: "border-[var(--warm-gold)]",
    akademisyen: "border-[var(--bosphorus-emerald)]",
};

/**
 * User Profile Bottom Sheet
 * Slides up when clicking a user marker
 * Shows: Name, Department, Role (with border color), Message button
 */
export function UserBottomSheet({ user, isOpen, onClose }: UserBottomSheetProps) {
    if (!user) return null;

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
                        className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/80 border-t border-white/10 rounded-t-3xl"
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
                        <div className="px-6 pb-8">
                            {/* Profile Header */}
                            <div className="flex items-center gap-5 mb-6">
                                {/* Avatar with role-colored border */}
                                <div className={`relative w-20 h-20 rounded-full overflow-hidden border-4 ${roleBorderColors[user.role]} ${user.role === "akademisyen" ? "shadow-[0_0_20px_var(--bosphorus-emerald-glow)]" : ""}`}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Online indicator */}
                                    {user.isOnline && (
                                        <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <h2
                                        className="text-2xl text-white mb-1"
                                        style={{ fontFamily: "var(--font-heading)" }}
                                    >
                                        {user.name}
                                    </h2>
                                    <p className="text-white/60 text-sm mb-2">
                                        {user.department || "Kullanıcı"}
                                    </p>
                                    <span
                                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${user.role === "akademisyen"
                                                ? "bg-[var(--bosphorus-emerald)] text-white"
                                                : user.role === "mezun"
                                                    ? "bg-[var(--warm-gold)] text-black"
                                                    : "bg-white/20 text-white"
                                            }`}
                                    >
                                        {roleLabels[user.role]}
                                    </span>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-2 mb-6 text-sm">
                                <span className={`w-2 h-2 rounded-full ${user.isOnline ? "bg-green-500" : "bg-gray-500"}`} />
                                <span className="text-white/60">
                                    {user.isOnline ? "Çevrimiçi" : "Çevrimdışı"}
                                </span>
                            </div>

                            {/* Action Button */}
                            <button className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--bosphorus-emerald)] text-white font-medium rounded-xl hover:bg-[var(--bosphorus-emerald-light)] transition-colors">
                                <MessageCircle className="w-5 h-5" />
                                Mesaj Gönder
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
