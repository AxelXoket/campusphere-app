import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines clsx and tailwind-merge for optimal class merging
 * Handles conditional classes and Tailwind conflicts
 */
export function cn(...inputs: Parameters<typeof clsx>) {
    return twMerge(clsx(inputs));
}
