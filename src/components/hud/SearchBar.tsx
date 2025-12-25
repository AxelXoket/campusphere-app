"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, User, MapPin, Calendar as CalendarIcon, Megaphone } from "lucide-react";
import { mockUsers } from "@/data/mockUsers";
import { mockEvents } from "@/data/mockEvents";

interface SearchResult {
    id: string;
    type: "user" | "event" | "location";
    title: string;
    subtitle: string;
}

interface SearchBarProps {
    onCalendarClick?: () => void;
    onAnnouncementsClick?: () => void;
}

/**
 * Glassmorphism search bar with dropdown results
 * Uses isMounted pattern to prevent hydration mismatch
 */
export function SearchBar({ onCalendarClick, onAnnouncementsClick }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Filter results based on query
    const results = useMemo<SearchResult[]>(() => {
        if (!query.trim()) return [];

        const lowerQuery = query.toLowerCase();
        const userResults: SearchResult[] = mockUsers
            .filter(u => u.name.toLowerCase().includes(lowerQuery) || u.department?.toLowerCase().includes(lowerQuery))
            .slice(0, 3)
            .map(u => ({
                id: u.id,
                type: "user",
                title: u.name,
                subtitle: u.department || "Kullanıcı",
            }));

        const eventResults: SearchResult[] = mockEvents
            .filter(e => e.title.toLowerCase().includes(lowerQuery) || e.location.toLowerCase().includes(lowerQuery))
            .slice(0, 3)
            .map(e => ({
                id: e.id,
                type: "event",
                title: e.title,
                subtitle: e.location,
            }));

        const locations: SearchResult[] = [];
        if ("istanbul".includes(lowerQuery) || "beyazıt".includes(lowerQuery)) {
            locations.push({ id: "loc-1", type: "location", title: "Beyazıt Kampüsü", subtitle: "Ana Kampüs" });
        }
        if ("avcılar".includes(lowerQuery)) {
            locations.push({ id: "loc-2", type: "location", title: "Avcılar Kampüsü", subtitle: "Mühendislik" });
        }

        return [...userResults, ...eventResults, ...locations].slice(0, 6);
    }, [query]);

    const showDropdown = isFocused && query.trim().length > 0;

    const getIcon = (type: SearchResult["type"]) => {
        switch (type) {
            case "user": return User;
            case "event": return CalendarIcon;
            case "location": return MapPin;
        }
    };

    // Sanitized classNames (no newlines/whitespace issues)
    const searchInputClass = isFocused
        ? "flex items-center gap-3 px-5 py-3 backdrop-blur-md bg-black/60 rounded-full border border-white/10 transition-all duration-200 w-80 shadow-lg shadow-black/30"
        : "flex items-center gap-3 px-5 py-3 backdrop-blur-md bg-black/60 rounded-full border border-white/10 transition-all duration-200 w-72";

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-30"
        >
            <div className="flex items-center gap-3">
                {/* Calendar Icon (Left) - Only render interactive button after mount */}
                {mounted ? (
                    <motion.button
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.15, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onCalendarClick}
                        className="w-11 h-11 rounded-full backdrop-blur-md bg-black/60 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                        aria-label="Takvimi aç"
                    >
                        <CalendarIcon className="w-5 h-5 text-white/70" />
                    </motion.button>
                ) : (
                    <div className="w-11 h-11 rounded-full backdrop-blur-md bg-black/60 border border-white/10 flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-white/70" />
                    </div>
                )}

                {/* Search Input */}
                <div className={searchInputClass}>
                    <Search className="w-5 h-5 text-white/60 flex-shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        placeholder="Kişi, konum veya etkinlik ara..."
                        className="flex-1 bg-transparent text-white placeholder:text-white/50 text-sm outline-none"
                    />
                </div>

                {/* Announcements Icon (Right) */}
                {mounted ? (
                    <motion.button
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.15, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onAnnouncementsClick}
                        className="w-11 h-11 rounded-full backdrop-blur-md bg-black/60 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                        aria-label="Duyuruları aç"
                    >
                        <Megaphone className="w-5 h-5 text-white/70" />
                    </motion.button>
                ) : (
                    <div className="w-11 h-11 rounded-full backdrop-blur-md bg-black/60 border border-white/10 flex items-center justify-center">
                        <Megaphone className="w-5 h-5 text-white/70" />
                    </div>
                )}
            </div>

            {/* Dropdown Results */}
            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-14 right-0 mt-2 backdrop-blur-md bg-black/70 rounded-2xl border border-white/10 overflow-hidden shadow-xl"
                    >
                        {results.length > 0 ? (
                            <ul className="py-2">
                                {results.map((result) => {
                                    const Icon = getIcon(result.type);
                                    return (
                                        <li key={`${result.type}-${result.id}`}>
                                            <button
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left"
                                                onClick={() => setQuery("")}
                                            >
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                    <Icon className="w-4 h-4 text-white/70" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-sm font-medium truncate">{result.title}</p>
                                                    <p className="text-white/50 text-xs truncate">{result.subtitle}</p>
                                                </div>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="px-4 py-6 text-center">
                                <p className="text-white/50 text-sm">Sonuç bulunamadı</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
