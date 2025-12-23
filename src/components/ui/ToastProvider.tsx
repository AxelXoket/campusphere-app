"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextValue {
    showToast: (type: ToastType, message: string, duration?: number) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((type: ToastType, message: string, duration = 4000) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const toast: Toast = { id, type, message, duration };

        setToasts(prev => [...prev, toast]);

        // Auto-remove after duration
        setTimeout(() => removeToast(id), duration);
    }, [removeToast]);

    const success = useCallback((message: string) => showToast("success", message), [showToast]);
    const error = useCallback((message: string) => showToast("error", message), [showToast]);
    const warning = useCallback((message: string) => showToast("warning", message), [showToast]);
    const info = useCallback((message: string) => showToast("info", message), [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
            {children}

            {/* Toast Container - Dark Theme */}
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map(toast => (
                        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    // Dark themed icons with emerald accent for success
    const iconColors = {
        success: "text-[var(--bosphorus-emerald)]",
        error: "text-red-400",
        warning: "text-amber-400",
        info: "text-blue-400",
    };

    const borderColors = {
        success: "border-[var(--bosphorus-emerald)]/30",
        error: "border-red-500/30",
        warning: "border-amber-500/30",
        info: "border-blue-500/30",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-xl bg-black/90 border ${borderColors[toast.type]}`}
        >
            {/* Icon with accent color */}
            <div className={iconColors[toast.type]}>
                {toast.type === "success" && <Check className="w-5 h-5" />}
                {toast.type === "error" && <X className="w-5 h-5" />}
                {toast.type === "warning" && <AlertCircle className="w-5 h-5" />}
                {toast.type === "info" && <Info className="w-5 h-5" />}
            </div>

            {/* Message in white */}
            <span className="text-sm font-medium text-white">{toast.message}</span>

            {/* Close button */}
            <button
                onClick={onClose}
                className="ml-2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
                <X className="w-4 h-4 text-white/70" />
            </button>
        </motion.div>
    );
}
