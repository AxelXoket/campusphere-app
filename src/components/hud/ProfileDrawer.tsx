"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Ghost, Bell, LogOut, Settings } from "lucide-react";

interface ProfileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        name: string;
        email: string;
        role: string;
        avatar: string;
    };
    isGhostMode: boolean;
    onGhostModeChange: (enabled: boolean) => void;
}

/**
 * Slide-over drawer from the right
 * Contains profile info and Ghost Mode toggle
 * Glassmorphism styling
 */
export function ProfileDrawer({
    isOpen,
    onClose,
    user,
    isGhostMode,
    onGhostModeChange
}: ProfileDrawerProps) {
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

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed top-0 right-0 h-full w-80 z-50 backdrop-blur-xl bg-black/70 border-l border-white/10"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/10">
                            <h2 className="text-lg font-medium text-white" style={{ fontFamily: "var(--font-heading)" }}>
                                Profil
                            </h2>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-white/70" />
                            </button>
                        </div>

                        {/* Profile Info */}
                        <div className="p-5">
                            <div className="flex items-center gap-4 mb-6">
                                {/* Avatar with Ghost Mode visual indicator */}
                                <div className="relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className={`w-16 h-16 rounded-full border-2 border-[var(--bosphorus-emerald)] transition-opacity ${isGhostMode ? "opacity-50" : ""}`}
                                    />
                                    {/* Ghost Mode indicator overlay */}
                                    {isGhostMode && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full"
                                        >
                                            <Ghost className="w-6 h-6 text-[var(--warm-gold)]" />
                                        </motion.div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">{user.name}</h3>
                                    <p className="text-white/60 text-sm">{user.email}</p>
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-[var(--bosphorus-emerald)] text-white text-xs rounded-full">
                                        {user.role}
                                    </span>
                                </div>
                            </div>

                            {/* Ghost Mode Toggle - Critical Feature with status indicator */}
                            <div className={`rounded-xl p-4 border mb-4 transition-colors ${isGhostMode ? "bg-[var(--warm-gold)]/10 border-[var(--warm-gold)]/30" : "bg-white/5 border-white/10"}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Ghost className={`w-5 h-5 transition-colors ${isGhostMode ? "text-[var(--warm-gold)]" : "text-white/60"}`} />
                                        <div>
                                            <p className="text-white font-medium">Hayalet Modu</p>
                                            <p className={`text-xs transition-colors ${isGhostMode ? "text-[var(--warm-gold)]" : "text-white/50"}`}>
                                                {isGhostMode ? "Konumun gizli" : "Konumunu gizle"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onGhostModeChange(!isGhostMode)}
                                        className={`
                      relative w-12 h-6 rounded-full transition-colors
                      ${isGhostMode ? "bg-[var(--warm-gold)]" : "bg-white/20"}
                    `}
                                    >
                                        <motion.span
                                            layout
                                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                                            animate={{ left: isGhostMode ? "calc(100% - 20px)" : "4px" }}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="space-y-1">
                                <DrawerMenuItem icon={Bell} label="Bildirimler" badge={3} />
                                <DrawerMenuItem icon={Settings} label="Ayarlar" />
                                <DrawerMenuItem icon={LogOut} label="Çıkış Yap" danger />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function DrawerMenuItem({
    icon: Icon,
    label,
    badge,
    danger
}: {
    icon: typeof Bell;
    label: string;
    badge?: number;
    danger?: boolean;
}) {
    return (
        <button
            className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
        ${danger ? "text-red-400 hover:bg-red-500/10" : "text-white/80 hover:bg-white/10"}
      `}
        >
            <Icon className="w-5 h-5" />
            <span className="flex-1 text-left">{label}</span>
            {badge && (
                <span className="w-5 h-5 bg-[var(--warm-gold)] text-black text-xs font-bold rounded-full flex items-center justify-center">
                    {badge}
                </span>
            )}
        </button>
    );
}
