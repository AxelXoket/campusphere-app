"use client";

import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface VerificationOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    featureName?: string;
}

/**
 * Glassmorphism overlay for restricted features
 * Shown when unverified users try to access verified-only features
 */
export function VerificationOverlay({ isOpen, onClose, featureName }: VerificationOverlayProps) {
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
                        className="fixed inset-0 bg-black/40 z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                       w-[90%] max-w-md p-6 rounded-2xl
                       backdrop-blur-xl bg-white/90 shadow-2xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-[#9ca3af] hover:text-[#4B5563] transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Content */}
                        <div className="text-center pt-2">
                            {/* Icon */}
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bosphorus-emerald)]/10 flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-[var(--bosphorus-emerald)]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                            </div>

                            {/* Title */}
                            <h3
                                className="text-xl text-[#1a1a1a] mb-2"
                                style={{ fontFamily: "var(--font-heading)" }}
                            >
                                Doğrulama Gerekli
                            </h3>

                            {/* Message */}
                            <p className="text-sm text-[var(--muted)] mb-6">
                                {featureName
                                    ? `"${featureName}" özelliği sadece doğrulanmış üyelere özeldir.`
                                    : "Bu özellik sadece doğrulanmış üyelere özeldir."
                                }
                            </p>

                            {/* Action Button */}
                            <button
                                onClick={onClose}
                                className="btn-primary w-full"
                            >
                                Anladım
                            </button>

                            {/* Verify Link */}
                            <a
                                href="/"
                                className="inline-block mt-4 text-sm text-[var(--bosphorus-emerald)] hover:underline"
                            >
                                Hesabımı Doğrula
                            </a>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
