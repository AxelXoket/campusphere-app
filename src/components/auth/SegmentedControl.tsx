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
    return (
        <div className="flex p-1 bg-gray-100 rounded-xl relative">
            {segments.map((segment) => {
                const isActive = segment.value === value;
                return (
                    <button
                        key={segment.value}
                        onClick={() => onChange(segment.value)}
                        className={cn(
                            "relative z-10 flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200",
                            isActive ? "text-[var(--bosphorus-emerald)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="segmented-background"
                                className="absolute inset-0 bg-white rounded-lg shadow-sm"
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
