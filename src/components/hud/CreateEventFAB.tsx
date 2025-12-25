"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, MapPin, Users } from "lucide-react";
import { useMockAuth } from "@/lib/MockAuthContext";

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Create Event Modal - can be triggered from ToolDock or anywhere else
 * Only accessible to privileged users (academician or alumnus)
 */
export function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
    const { user } = useMockAuth();
    const [showSuccess, setShowSuccess] = useState(false);

    const handleCreateEvent = () => {
        // Mock event creation
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            onClose();
        }, 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.3 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/10">
                            <h2 className="text-lg font-semibold text-white">
                                Etkinlik Oluştur
                            </h2>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {showSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-8 text-center"
                            >
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                                    <Calendar className="w-8 h-8 text-white" />
                                </div>
                                <p className="text-white font-medium">Etkinlik oluşturuldu!</p>
                                <p className="text-white/50 text-sm mt-1">(Demo modu)</p>
                            </motion.div>
                        ) : (
                            <div className="p-5 space-y-4">
                                {/* Event Title */}
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                                        Etkinlik Adı
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Kariyer Günü 2025"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/40 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    />
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        Tarih
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all [color-scheme:dark]"
                                    />
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                                        <MapPin className="w-4 h-4 inline mr-1" />
                                        Konum
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Kongre Merkezi - Ana Salon"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/40 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    />
                                </div>

                                {/* Invite */}
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                                        <Users className="w-4 h-4 inline mr-1" />
                                        Davet
                                    </label>
                                    <select className="w-full px-4 py-3 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all hover:bg-white/10">
                                        <option value="all" className="bg-black/90 text-white">Tüm Öğrenciler</option>
                                        <option value="faculty" className="bg-black/90 text-white">Sadece Fakültem</option>
                                        <option value="department" className="bg-black/90 text-white">Sadece Bölümüm</option>
                                    </select>
                                </div>

                                {/* Role indicator */}
                                <p className="text-xs text-white/40 text-center pt-2">
                                    {user?.role === "academician" ? "👨‍🏫 Akademisyen" : "🎓 Mezun"} olarak etkinlik oluşturuyorsunuz
                                </p>

                                {/* Submit */}
                                <button
                                    onClick={handleCreateEvent}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
                                >
                                    Etkinlik Oluştur
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
