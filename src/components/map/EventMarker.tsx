"use client";

import { motion } from "motion/react";
import { MockEvent } from "@/data/mockEvents";
import { Calendar } from "lucide-react";

interface EventMarkerProps {
    event: MockEvent;
    onClick?: () => void;
}

// Organic spring settings for natural emergence
const organicSpring = {
    type: "spring" as const,
    stiffness: 120,
    damping: 14,
};

/**
 * Gold marker for events on the map
 * Uses Warm Gold (#FFD700) with glow effect
 * Animation: Organic spring for natural "growing" effect
 */
export function EventMarker({ event, onClick }: EventMarkerProps) {
    return (
        <motion.button
            onClick={onClick}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={organicSpring}
            whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.95 }}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[var(--warm-gold)] shadow-[0_0_12px_rgba(255,215,0,0.6)] cursor-pointer"
            title={`${event.title} - ${event.date}`}
        >
            <Calendar className="w-5 h-5 text-black" />

            {/* Attendee count badge with delayed pop */}
            <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...organicSpring, delay: 0.2 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black text-xs font-bold rounded-full flex items-center justify-center shadow"
            >
                {event.attendeeCount > 99 ? "99+" : event.attendeeCount}
            </motion.span>
        </motion.button>
    );
}
