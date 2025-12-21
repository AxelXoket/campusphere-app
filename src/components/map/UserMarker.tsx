"use client";

import { motion } from "motion/react";
import { MockUser } from "@/data/mockUsers";
import { cn } from "@/lib/utils";

interface UserMarkerProps {
    user: MockUser;
    onClick?: () => void;
}

// Organic spring settings for natural emergence
const organicSpring = {
    type: "spring" as const,
    stiffness: 120,
    damping: 14,
};

/**
 * Circular avatar marker with role-based borders
 * Student: White border
 * Alumni: Gold border (Warm Gold #FFD700)
 * Academic: Emerald border with glow (Bosphorus Emerald #004D40)
 * 
 * Animation: Organic spring for natural "growing" effect
 */
export function UserMarker({ user, onClick }: UserMarkerProps) {
    const borderStyles = {
        ogrenci: "border-white shadow-md",
        mezun: "border-[var(--warm-gold)] shadow-[0_0_8px_rgba(255,215,0,0.5)]",
        akademisyen: "border-[var(--bosphorus-emerald)] shadow-[0_0_12px_var(--bosphorus-emerald-glow)]",
    };

    return (
        <motion.button
            onClick={onClick}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={organicSpring}
            whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                "relative w-10 h-10 rounded-full border-3 overflow-hidden cursor-pointer",
                borderStyles[user.role],
                !user.isOnline && "opacity-60"
            )}
            title={`${user.name} - ${user.department || ""}`}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
            />

            {/* Online indicator with subtle pop */}
            {user.isOnline && (
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ ...organicSpring, delay: 0.15 }}
                    className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"
                />
            )}
        </motion.button>
    );
}
