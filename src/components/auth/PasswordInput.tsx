"use client";

import { useState, forwardRef, InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
    error?: string;
}

/**
 * Password input with visibility toggle
 * Minimalist Eye/EyeOff icon on the right
 * Maintains Underline Input style
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ label, error, className, id, ...props }, ref) => {
        const [isVisible, setIsVisible] = useState(false);
        const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="space-y-1">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-white"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        id={inputId}
                        type={isVisible ? "text" : "password"}
                        className={cn(
                            "input-underline pr-10",
                            error && "border-b-[var(--error)]",
                            className
                        )}
                        {...props}
                    />
                    {/* Visibility Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setIsVisible(!isVisible)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white transition-colors duration-200"
                        tabIndex={-1}
                        aria-label={isVisible ? "Şifreyi gizle" : "Şifreyi göster"}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={isVisible ? "visible" : "hidden"}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.15 }}
                            >
                                {isVisible ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </button>
                </div>
                {error && (
                    <p className="text-sm text-[var(--error)] mt-1">{error}</p>
                )}
            </div>
        );
    }
);

PasswordInput.displayName = "PasswordInput";
