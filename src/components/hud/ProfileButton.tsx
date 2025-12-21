"use client";

import { motion } from "motion/react";
import { Ghost } from "lucide-react";

interface ProfileButtonProps {
    avatar: string;
    onClick: () => void;
    isGhostMode?: boolean;
}

/**
 * Profile avatar button (top right)
 * Shows Ghost Mode indicator when active
 */
export function ProfileButton({ avatar, onClick, isGhostMode }: ProfileButtonProps) {
    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="absolute top-4 right-4 z-20 w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-lg backdrop-blur-sm"
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={avatar}
                alt="Profile"
                className={`w-full h-full object-cover transition-opacity ${isGhostMode ? "opacity-50" : ""}`}
            />

            {/* Ghost Mode overlay indicator */}
            {isGhostMode && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/40"
                >
                    <Ghost className="w-5 h-5 text-[var(--warm-gold)]" />
                </motion.div>
            )}
        </motion.button>
    );
}
