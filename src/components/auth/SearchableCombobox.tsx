"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchableComboboxProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    required?: boolean;
}

/**
 * Premium Searchable Combobox
 * Dark glassmorphism styling with type-to-search functionality
 * Opens strictly downward with max 5 visible items
 */
export function SearchableCombobox({
    options,
    value,
    onChange,
    placeholder = "Seçiniz...",
    label,
    disabled = false,
    required = false,
}: SearchableComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Filter options based on search query
    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearchQuery("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Reset highlighted index when filtered options change
    useEffect(() => {
        setHighlightedIndex(0);
    }, [filteredOptions.length]);

    // Scroll highlighted item into view
    useEffect(() => {
        if (listRef.current && highlightedIndex >= 0) {
            const items = listRef.current.querySelectorAll('[data-combobox-item]');
            const highlightedItem = items[highlightedIndex] as HTMLElement;
            if (highlightedItem) {
                highlightedItem.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex]);

    const handleSelect = useCallback((option: string) => {
        onChange(option);
        setIsOpen(false);
        setSearchQuery("");
    }, [onChange]);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
                break;
            case "Enter":
                e.preventDefault();
                if (filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex]);
                }
                break;
            case "Escape":
                setIsOpen(false);
                setSearchQuery("");
                break;
        }
    }, [filteredOptions, highlightedIndex, handleSelect]);

    const handleTriggerClick = () => {
        if (!disabled) {
            setIsOpen(true);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-200 mb-1.5">
                    {label}
                </label>
            )}

            {/* Trigger / Input */}
            <div
                onClick={handleTriggerClick}
                className={cn(
                    "relative w-full px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer",
                    "bg-black/60 backdrop-blur-xl",
                    isOpen
                        ? "border-emerald-500/50 ring-2 ring-emerald-500/20"
                        : "border-white/10 hover:bg-white/10 hover:border-white/20",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                {isOpen ? (
                    <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-white/50 flex-shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ara..."
                            className="w-full bg-transparent text-white text-sm outline-none placeholder:text-white/40"
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <span className={cn(
                            "text-sm truncate",
                            value ? "text-white" : "text-white/50"
                        )}>
                            {value || placeholder}
                        </span>
                        <ChevronDown className={cn(
                            "w-4 h-4 text-white/50 flex-shrink-0 transition-transform",
                            isOpen && "rotate-180"
                        )} />
                    </div>
                )}
            </div>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={cn(
                            "absolute z-50 w-full mt-2",
                            "bg-black/80 backdrop-blur-2xl",
                            "border border-white/10 rounded-xl shadow-2xl",
                            "overflow-hidden"
                        )}
                        style={{ top: "100%" }}
                    >
                        <div
                            ref={listRef}
                            className="max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                        >
                            {filteredOptions.length === 0 ? (
                                <div className="py-4 px-4 text-center text-white/50 text-sm">
                                    Sonuç bulunamadı
                                </div>
                            ) : (
                                filteredOptions.map((option, index) => (
                                    <div
                                        key={option}
                                        data-combobox-item
                                        onClick={() => handleSelect(option)}
                                        className={cn(
                                            "flex items-center justify-between py-3 px-4 cursor-pointer transition-colors",
                                            "text-sm font-sans",
                                            index === highlightedIndex
                                                ? "bg-white/10 text-white"
                                                : "text-gray-300 hover:bg-white/5 hover:text-white",
                                            option === value && "text-emerald-400"
                                        )}
                                    >
                                        <span className="truncate">{option}</span>
                                        {option === value && (
                                            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-2" />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
