"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Users, GraduationCap, BookOpen } from "lucide-react";
import { RoleType } from "@/components/auth";

interface FilterOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    filters: Record<RoleType, boolean>;
    onFilterChange: (role: RoleType, enabled: boolean) => void;
}

const filterOptions: { role: RoleType; label: string; icon: typeof Users; color: string }[] = [
    { role: "ogrenci", label: "Öğrenciler", icon: Users, color: "bg-white/20 border-white" },
    { role: "mezun", label: "Mezunlar", icon: GraduationCap, color: "bg-[var(--warm-gold)]/20 border-[var(--warm-gold)]" },
    { role: "akademisyen", label: "Akademisyenler", icon: BookOpen, color: "bg-[var(--bosphorus-emerald)]/20 border-[var(--bosphorus-emerald)]" },
];

/**
 * Map Filter Overlay - Glassmorphism
 * Toggle visibility for each role type
 */
export function FilterOverlay({ isOpen, onClose, filters, onFilterChange }: FilterOverlayProps) {
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
                        className="fixed inset-0 bg-black/30 z-40"
                    />

                    {/* Filter Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed right-20 top-1/2 -translate-y-1/2 z-50 w-64 backdrop-blur-xl bg-black/70 rounded-2xl border border-white/10 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="text-white font-medium" style={{ fontFamily: "var(--font-heading)" }}>
                                Filtrele
                            </h3>
                            <button
                                onClick={onClose}
                                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-4 h-4 text-white/70" />
                            </button>
                        </div>

                        {/* Filter Options */}
                        <div className="p-4 space-y-3">
                            {filterOptions.map(({ role, label, icon: Icon, color }) => (
                                <button
                                    key={role}
                                    onClick={() => onFilterChange(role, !filters[role])}
                                    className={`
                    w-full flex items-center gap-3 p-3 rounded-xl border transition-all
                    ${filters[role]
                                            ? color
                                            : "bg-white/5 border-white/10 opacity-50"
                                        }
                  `}
                                >
                                    <Icon className="w-5 h-5 text-white" />
                                    <span className="text-white text-sm flex-1 text-left">{label}</span>
                                    <div className={`w-5 h-5 rounded-full border-2 transition-colors ${filters[role] ? "bg-white border-white" : "border-white/30"}`}>
                                        {filters[role] && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-full h-full rounded-full bg-[var(--bosphorus-emerald)]"
                                            />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
