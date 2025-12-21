"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, MapPin, Compass, Building } from "lucide-react";

interface LayersOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const mapLayers = [
    {
        id: "poi",
        icon: MapPin,
        label: "Önemli Noktalar",
        description: "Kütüphane, kafeterya, vb.",
        enabled: true
    },
    {
        id: "buildings",
        icon: Building,
        label: "Binalar",
        description: "Fakülte ve idari binalar",
        enabled: true
    },
    {
        id: "compass",
        icon: Compass,
        label: "Yön Göstergesi",
        description: "Kuzeyi göster",
        enabled: false
    },
];

/**
 * Map Layers Overlay - Glassmorphism
 * Toggle map layer visibility
 * PRD Section 4.C.3 - Map Tools
 */
export function LayersOverlay({ isOpen, onClose }: LayersOverlayProps) {
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

                    {/* Layers Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed right-20 top-1/2 -translate-y-1/2 z-50 w-72 backdrop-blur-xl bg-black/70 rounded-2xl border border-white/10 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3
                                className="text-white font-medium"
                                style={{ fontFamily: "var(--font-heading)" }}
                            >
                                Harita Katmanları
                            </h3>
                            <button
                                onClick={onClose}
                                className="w-7 h-7 grid place-items-center rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-4 h-4 text-white/70" />
                            </button>
                        </div>

                        {/* Layer Options */}
                        <div className="p-4 space-y-3">
                            {mapLayers.map(({ id, icon: Icon, label, description, enabled }) => (
                                <LayerToggle
                                    key={id}
                                    icon={Icon}
                                    label={label}
                                    description={description}
                                    enabled={enabled}
                                />
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function LayerToggle({
    icon: Icon,
    label,
    description,
    enabled: initialEnabled,
}: {
    icon: typeof MapPin;
    label: string;
    description: string;
    enabled: boolean;
}) {
    const [enabled, setEnabled] = useState(initialEnabled);

    return (
        <button
            onClick={() => setEnabled(!enabled)}
            className={`
        w-full flex items-center gap-3 p-3 rounded-xl border transition-all
        ${enabled
                    ? "bg-[var(--bosphorus-emerald)]/20 border-[var(--bosphorus-emerald)]/50"
                    : "bg-white/5 border-white/10 opacity-60"
                }
      `}
        >
            <div className={`
        w-10 h-10 rounded-lg grid place-items-center transition-colors
        ${enabled ? "bg-[var(--bosphorus-emerald)]" : "bg-white/10"}
      `}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
                <p className="text-white text-sm font-medium">{label}</p>
                <p className="text-white/50 text-xs">{description}</p>
            </div>
            <div className={`
        w-5 h-5 rounded-full border-2 transition-colors grid place-items-center
        ${enabled ? "bg-[var(--bosphorus-emerald)] border-[var(--bosphorus-emerald)]" : "border-white/30"}
      `}>
                {enabled && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-white rounded-full"
                    />
                )}
            </div>
        </button>
    );
}

import { useState } from "react";
