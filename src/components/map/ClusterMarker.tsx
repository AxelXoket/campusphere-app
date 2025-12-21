"use client";

import { motion } from "motion/react";

interface ClusterMarkerProps {
    count: number;
    onClick: () => void;
}

// Organic spring settings for natural emergence
const organicSpring = {
    type: "spring" as const,
    stiffness: 120,
    damping: 14,
};

/**
 * Cluster marker showing number of grouped users
 * PRD: "bubbles merge into a number (e.g., '15' in Beşiktaş)"
 * Uses Bosphorus Emerald (#004D40) for Academic Heritage vibe
 * Animation: Organic spring for natural "growing" effect
 */
export function ClusterMarker({ count, onClick }: ClusterMarkerProps) {
    // Size scales with count
    const size = Math.min(40 + (count / 5) * 4, 60);

    return (
        <motion.button
            onClick={onClick}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={organicSpring}
            whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center rounded-full bg-[var(--bosphorus-emerald)] border-2 border-white shadow-lg cursor-pointer"
            style={{ width: size, height: size }}
            title={`${count} kişi - yakınlaştırmak için tıkla`}
        >
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                className="text-white font-bold text-sm"
            >
                {count > 99 ? "99+" : count}
            </motion.span>
        </motion.button>
    );
}
