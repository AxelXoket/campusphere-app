"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, MessageCircle, MapPin, GraduationCap, Briefcase } from "lucide-react";
import { MockUser } from "@/data/mockUsers";
import { RoleType } from "@/components/auth";

interface UserBottomSheetProps {
    user: MockUser | null;
    isOpen: boolean;
    onClose: () => void;
    onSendMessage?: (user: MockUser) => void; // Callback for DM workflow
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

// Role badge styles
const roleBadgeStyles: Record<RoleType, string> = {
    ogrenci: "bg-white/20 text-white",
    mezun: "bg-[var(--warm-gold)] text-black",
    akademisyen: "bg-[var(--bosphorus-emerald)] text-white",
};

/**
 * User Profile Modal - CLONED FROM EVENT MODAL DESIGN
 * Centered floating modal with Send Message workflow
 */
export function UserBottomSheet({ user, isOpen, onClose, onSendMessage }: UserBottomSheetProps) {
    if (!user) return null;

    const handleSendMessage = () => {
        if (onSendMessage) {
            onSendMessage(user);
        }
        onClose(); // Always close modal
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
                        {/* Panel */}
                        <div className="relative backdrop-blur-xl bg-black/90 border border-white/10 rounded-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl shadow-black/60">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-colors z-20"
                                aria-label="Kapat"
                            >
                                <X className="w-5 h-5 text-white/80" />
                            </button>

                            {/* Content */}
                            <div className="p-6">
                                {/* Profile Header */}
                                <div className="flex items-center gap-5 mb-6">
                                    <div className={`relative w-24 h-24 rounded-full overflow-hidden border-4 ${roleBorderColors[user.role]} ${user.role === "akademisyen" ? "shadow-[0_0_25px_var(--bosphorus-emerald-glow)]" : ""
                                        }`}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                        {user.isOnline && (
                                            <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-3 border-black rounded-full" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h2
                                            className="text-2xl font-bold text-white mb-2"
                                            style={{ fontFamily: "var(--font-heading)" }}
                                        >
                                            {user.name}
                                        </h2>
                                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${roleBadgeStyles[user.role]}`}>
                                            {roleLabels[user.role]}
                                        </span>
                                    </div>
                                </div>

                                {/* Meta Info Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {user.department && (
                                        <MetaItem icon={GraduationCap} label={user.department} />
                                    )}
                                    {user.faculty && (
                                        <MetaItem icon={MapPin} label={user.faculty} />
                                    )}
                                    <MetaItem
                                        icon={Briefcase}
                                        label={user.isOnline ? "Çevrimiçi" : "Çevrimdışı"}
                                    />
                                </div>

                                {/* Role Info Card */}
                                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 mb-6">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === "akademisyen"
                                            ? "bg-[var(--bosphorus-emerald)]"
                                            : user.role === "mezun"
                                                ? "bg-[var(--warm-gold)]"
                                                : "bg-white/20"
                                        }`}>
                                        {user.role === "akademisyen" && <GraduationCap className="w-5 h-5 text-white" />}
                                        {user.role === "mezun" && <Briefcase className="w-5 h-5 text-black" />}
                                        {user.role === "ogrenci" && <GraduationCap className="w-5 h-5 text-white" />}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">{roleLabels[user.role]}</p>
                                        <p className="text-white/50 text-xs">
                                            {user.role === "akademisyen" && "Akademik Kadro"}
                                            {user.role === "mezun" && "İstanbul Üniversitesi Mezunu"}
                                            {user.role === "ogrenci" && "Aktif Öğrenci"}
                                        </p>
                                    </div>
                                </div>

                                {/* Send Message Button - MAIN ACTION */}
                                <button
                                    onClick={handleSendMessage}
                                    className="w-full py-3.5 bg-[var(--bosphorus-emerald)] text-white font-semibold rounded-xl hover:bg-[var(--bosphorus-emerald-light)] transition-colors shadow-lg shadow-[var(--bosphorus-emerald)]/30 flex items-center justify-center gap-2"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Mesaj Gönder
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function MetaItem({ icon: Icon, label }: { icon: typeof GraduationCap; label: string }) {
    return (
        <div className="flex items-center gap-2 text-gray-400">
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm truncate">{label}</span>
        </div>
    );
}
