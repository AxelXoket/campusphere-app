"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";

interface CheckboxProps {
    id: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

/**
 * Minimalist checkbox with Bosphorus Emerald brand color
 * Animated checkmark using Framer Motion
 */
export function Checkbox({ id, label, checked, onChange }: CheckboxProps) {
    return (
        <label
            htmlFor={id}
            className="flex items-center gap-2.5 cursor-pointer group"
        >
            <div className="relative">
                <input
                    type="checkbox"
                    id={id}
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only"
                />
                <motion.div
                    className={`
            w-4 h-4 rounded border-2 transition-colors flex items-center justify-center
            ${checked
                            ? "bg-[var(--bosphorus-emerald)] border-[var(--bosphorus-emerald)]"
                            : "bg-transparent border-[var(--input-border)] group-hover:border-[var(--muted)]"
                        }
          `}
                    animate={{ scale: checked ? 1 : 1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <motion.div
                        initial={false}
                        animate={{
                            scale: checked ? 1 : 0,
                            opacity: checked ? 1 : 0
                        }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </motion.div>
                </motion.div>
            </div>
            <span className="text-sm text-[var(--muted)] select-none">
                {label}
            </span>
        </label>
    );
}
