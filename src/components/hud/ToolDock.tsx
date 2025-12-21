"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Settings, Filter, Layers } from "lucide-react";

interface ToolDockItem {
    id: string;
    icon: typeof Settings;
    label: string;
}

const tools: ToolDockItem[] = [
    { id: "settings", icon: Settings, label: "Ayarlar" },
    { id: "filter", icon: Filter, label: "Filtrele" },
    { id: "layers", icon: Layers, label: "Katmanlar" },
];

interface ToolDockProps {
    onFilterClick?: () => void;
    onLayersClick?: () => void;
}

/**
 * Vertical pill dock on the right edge
 * TRUE MacBook Dock style - neighboring items also scale
 */
export function ToolDock({ onFilterClick, onLayersClick }: ToolDockProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20"
        >
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
                        className="absolute right-14 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap pointer-events-none shadow-lg"
                    >
                        {tool.label}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
