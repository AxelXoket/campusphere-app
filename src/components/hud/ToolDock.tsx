"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Settings, Filter, Layers, Plus } from "lucide-react";
import { useMockAuth } from "@/lib/MockAuthContext";

interface ToolDockItem {
    id: string;
    icon: typeof Settings;
    label: string;
}

interface ToolDockProps {
    onFilterClick?: () => void;
    onLayersClick?: () => void;
    onCreateEventClick?: () => void;
}

/**
 * Vertical pill dock on the right edge
 * Create Event button positioned above when user is privileged
 */
export function ToolDock({ onFilterClick, onLayersClick, onCreateEventClick }: ToolDockProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isCreateHovered, setIsCreateHovered] = useState(false);
    const { isPrivileged } = useMockAuth();

    // Standard tools list
    const tools: ToolDockItem[] = [
        { id: "filter", icon: Filter, label: "Filtrele" },
        { id: "layers", icon: Layers, label: "Katmanlar" },
    ];

    // Calculate scale based on distance from hovered item (MacBook Dock effect)
    const getScale = (index: number): number => {
        if (hoveredIndex === null) return 1;
        const distance = Math.abs(index - hoveredIndex);
        if (distance === 0) return 1.4;
        if (distance === 1) return 1.2;
        return 1;
    };

    const handleClick = (toolId: string) => {
        if (toolId === "filter" && onFilterClick) {
            onFilterClick();
        }
        if (toolId === "layers" && onLayersClick) {
            onLayersClick();
        }
        // Settings - could open a settings modal
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3"
        >
            {/* Create Event Button - Above ToolDock for privileged users */}
            {isPrivileged && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                    onClick={onCreateEventClick}
                    onMouseEnter={() => setIsCreateHovered(true)}
                    onMouseLeave={() => setIsCreateHovered(false)}
                    className="relative w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-150"
                >
                    <Plus className="w-5 h-5" />

                    {/* Tooltip - CSS-based for instant response */}
                    <span
                        className={`absolute right-14 px-3 py-1.5 bg-black/90 text-white text-xs rounded-md whitespace-nowrap pointer-events-none shadow-lg transition-all duration-150 ${isCreateHovered
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 translate-x-2"
                            }`}
                    >
                        Etkinlik Oluştur
                    </span>
                </motion.button>
            )}

            {/* Main ToolDock */}
            <div className="flex flex-col items-center gap-1 p-2 backdrop-blur-md bg-black/60 rounded-full border border-white/10">
                {tools.map((tool, index) => (
                    <ToolDockButton
                        key={tool.id}
                        tool={tool}
                        scale={getScale(index)}
                        isHovered={hoveredIndex === index}
                        onHover={() => setHoveredIndex(index)}
                        onLeave={() => setHoveredIndex(null)}
                        onClick={() => handleClick(tool.id)}
                    />
                ))}
            </div>
        </motion.div>
    );
}

function ToolDockButton({
    tool,
    scale,
    isHovered,
    onHover,
    onLeave,
    onClick,
}: {
    tool: ToolDockItem;
    scale: number;
    isHovered: boolean;
    onHover: () => void;
    onLeave: () => void;
    onClick: () => void;
}) {
    const Icon = tool.icon;

    return (
        <motion.button
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            onClick={onClick}
            animate={{
                scale,
                transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
            whileTap={{ scale: scale * 0.9 }}
            className="relative w-10 h-10 grid place-items-center rounded-full hover:bg-white/10 transition-colors origin-center"
        >
            <Icon
                className="transition-colors duration-150"
                style={{
                    width: 20,
                    height: 20,
                    color: isHovered ? "white" : "rgba(255,255,255,0.7)"
                }}
            />

            {/* Tooltip */}
            <AnimatePresence>
                {isHovered && (
                    <motion.span
                        initial={{ opacity: 0, x: 10, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.8 }}
                        className="absolute right-14 px-2 py-1 bg-black/90 text-white text-[10px] rounded-md whitespace-nowrap pointer-events-none shadow-lg"
                    >
                        {tool.label}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
