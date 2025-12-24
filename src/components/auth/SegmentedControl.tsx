"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export type RoleType = "mezun" | "ogrenci" | "akademisyen";

interface SegmentedControlProps {
    value: RoleType;
    onChange: (value: RoleType) => void;
}

const segments: { value: RoleType; label: string }[] = [
    { value: "mezun", label: "Mezun" },
    { value: "ogrenci", label: "Öğrenci" },
    { value: "akademisyen", label: "Akademisyen" },
];

/**
 * Animated Segmented Control for role selection
 * Uses Framer Motion layoutId for smooth sliding background
 */
export function SegmentedControl({ value, onChange }: SegmentedControlProps) {
    // Role-specific colors
    const roleColors: Record<RoleType, { text: string; hover: string; bg: string; border: string }> = {
        mezun: {
            text: "text-[var(--warm-gold)]",
            hover: "hover:text-[var(--warm-gold)]",
            bg: "bg-[var(--warm-gold)]/15",
            border: "border-[var(--warm-gold)]/30",
        },
        ogrenci: {
            text: "text-white",
            hover: "hover:text-white",
            bg: "bg-white/15",
            border: "border-white/30",
        },
        akademisyen: {
            text: "text-emerald-400",
            hover: "hover:text-emerald-400",
            bg: "bg-emerald-500/25",
            border: "border-emerald-400/40",
        },
    };

    return (
        <div className="flex p-1.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 relative">
            {segments.map((segment) => {
                const isActive = segment.value === value;
                const colors = roleColors[segment.value];

                return (
                    <button
                        key={segment.value}
                        type="button"
                        onClick={() => onChange(segment.value)}
                        className={cn(
                            "relative z-10 flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200",
                            isActive
                                ? colors.text
                                : `text-white/40 ${colors.hover} hover:bg-white/5`
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="segmented-background"
                                className={cn(
                                    "absolute inset-0 rounded-lg shadow-lg",
                                    colors.bg,
                                    colors.border,
                                    "border"
                                )}
                                style={{ zIndex: -1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 35,
                                }}
                            />
                        )}
                        <span className="relative z-10">{segment.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
