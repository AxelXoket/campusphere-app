"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface UnderlineInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

/**
 * Minimalist underline-only input field
 * No box borders, only bottom border that changes on focus
 */
export const UnderlineInput = forwardRef<HTMLInputElement, UnderlineInputProps>(
    ({ label, error, className, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="space-y-1">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-[var(--muted)]"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={cn(
                        "input-underline",
                        error && "border-b-[var(--error)]",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-sm text-[var(--error)] mt-1">{error}</p>
                )}
            </div>
        );
    }
);

UnderlineInput.displayName = "UnderlineInput";
