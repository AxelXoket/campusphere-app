"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, ChevronDown, Sun, Cloud, CloudRain } from "lucide-react";
import { mockEvents, MockEvent } from "@/data/mockEvents";

interface CalendarDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    onEventClick: (event: MockEvent) => void;
}

// Turkish day names with correct abbreviations
const turkishDayAbbr = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const turkishMonths = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

const mockWeather = ["sunny", "cloudy", "sunny", "rainy", "cloudy", "sunny", "cloudy"] as const;
type WeatherType = typeof mockWeather[number];

const WeatherIcon = ({ type, size = "md" }: { type: WeatherType; size?: "sm" | "md" | "lg" }) => {
    const sizeClass = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";
    const iconProps = { className: `${sizeClass} text-white/70` };
    switch (type) {
        case "sunny": return <Sun {...iconProps} />;
        case "cloudy": return <Cloud {...iconProps} />;
        case "rainy": return <CloudRain {...iconProps} />;
    }
};

interface DayData {
    dateKey: string;
    dayNumber: number;
    dayAbbr: string;
    weather: WeatherType;
    events: MockEvent[];
    isToday: boolean;
    month: number;
}

interface WeekData {
    weekStart: Date;
    weekEnd: Date;
    startDay: number;
    endDay: number;
    monthLabel: string;
    isCurrentWeek: boolean;
    isThisWeek: boolean;
}

function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function CalendarDropdown({ isOpen, onClose, onEventClick }: CalendarDropdownProps) {
    const [weekOffset, setWeekOffset] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    const { days, monthLabel } = useMemo(() => {
        if (!hasMounted) {
            return {
                days: Array.from({ length: 7 }, (_, i) => ({
                    dateKey: `placeholder-${i}`,
                    dayNumber: 0,
                    dayAbbr: turkishDayAbbr[i],
                    weather: "sunny" as WeatherType,
                    events: [],
                    isToday: false,
                    month: 0,
                })),
                monthLabel: "",
            };
        }

        const now = new Date();
        const monday = getMonday(now);
        monday.setDate(monday.getDate() + weekOffset * 7);

        const result: DayData[] = [];
        const months = new Set<number>();

        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);

            const dayEvents = mockEvents.filter(event => {
                const eventDate = new Date(event.date);
                return (
                    eventDate.getFullYear() === date.getFullYear() &&
                    eventDate.getMonth() === date.getMonth() &&
                    eventDate.getDate() === date.getDate()
                );
            });

            const today = new Date();
            const isToday = date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();

            months.add(date.getMonth());

            result.push({
                dateKey: date.toISOString(),
                dayNumber: date.getDate(),
                dayAbbr: turkishDayAbbr[i],
                weather: mockWeather[i % mockWeather.length],
                events: dayEvents,
                isToday,
                month: date.getMonth(),
            });
        }

        const monthArray = Array.from(months);
        const year = monday.getFullYear();
        const label = monthArray.length === 1
            ? `${turkishMonths[monthArray[0]]} ${year}`
            : `${turkishMonths[monthArray[0]]} - ${turkishMonths[monthArray[1]]} ${year}`;

        return { days: result, monthLabel: label };
    }, [weekOffset, hasMounted]);

    const weeks = useMemo<WeekData[]>(() => {
        if (!hasMounted) return [];

        const now = new Date();
        const currentMonday = getMonday(now);
        const result: WeekData[] = [];

        for (let w = 0; w < 8; w++) {
            const weekStart = new Date(currentMonday);
            weekStart.setDate(currentMonday.getDate() + w * 7);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            const startMonth = weekStart.getMonth();
            const endMonth = weekEnd.getMonth();

            const monthLabel = startMonth === endMonth
                ? turkishMonths[startMonth]
                : `${turkishMonths[startMonth]} - ${turkishMonths[endMonth]}`;

            result.push({
                weekStart,
                weekEnd,
                startDay: weekStart.getDate(),
                endDay: weekEnd.getDate(),
                monthLabel,
                isCurrentWeek: w === weekOffset,
                isThisWeek: w === 0,
            });
        }

        return result;
    }, [weekOffset, hasMounted]);

    const handleEventClick = (event: MockEvent) => {
        onEventClick(event);
        onClose();
    };

    const handleWeekSelect = (weekIndex: number) => {
        setWeekOffset(weekIndex);
        setIsExpanded(false);
    };

    const goToPrevious = () => setWeekOffset(prev => prev - 1);
    const goToNext = () => setWeekOffset(prev => prev + 1);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40"
                    />

                    {/* MEGA-SCALE Container */}
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-4xl"
                    >
                        <div className="backdrop-blur-xl bg-black/75 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="px-6 pt-6 pb-4">
                                <div className="flex items-center justify-between mb-6">
                                    <h3
                                        className="text-xl font-bold text-white"
                                        style={{ fontFamily: "var(--font-heading)" }}
                                    >
                                        {hasMounted ? monthLabel : "Takvim"}
                                    </h3>
                                    <span className="text-sm text-white/60 font-medium">
                                        {weekOffset === 0 ? "Bu Hafta" : weekOffset > 0 ? `+${weekOffset} Hafta` : `${weekOffset} Hafta`}
                                    </span>
                                </div>

                                {/* 7-Day Grid */}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={goToPrevious}
                                        className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                        aria-label="Önceki hafta"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-white" />
                                    </button>

                                    <motion.div
                                        key={weekOffset}
                                        initial={{ opacity: 0, x: weekOffset > 0 ? 40 : -40 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="flex-1 grid grid-cols-7 gap-3"
                                    >
                                        {hasMounted ? (
                                            days.map((day) => {
                                                const hasEvent = day.events.length > 0;
                                                return (
                                                    <div key={day.dateKey} className="flex flex-col items-center gap-1.5 relative pt-6">
                                                        {/* HD Floating BUGÜN Pill */}
                                                        {day.isToday && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 5 }}
                                                                animate={{ opacity: [0.8, 1, 0.8], y: 0 }}
                                                                transition={{ opacity: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }, y: { duration: 0.2 } }}
                                                                className="absolute -top-0 left-1/2 -translate-x-1/2 z-20"
                                                            >
                                                                <div className="backdrop-blur-md bg-[var(--bosphorus-emerald)]/80 border border-[var(--bosphorus-emerald)] px-2.5 py-0.5 rounded-full shadow-lg shadow-[var(--bosphorus-emerald)]/50">
                                                                    <span className="text-[10px] font-medium text-white tracking-wide">
                                                                        Bugün
                                                                    </span>
                                                                </div>
                                                            </motion.div>
                                                        )}

                                                        {/* Day Box - MEGA Scale with Radial Glow */}
                                                        <motion.div
                                                            whileHover={hasEvent ? { scale: 1.03 } : undefined}
                                                            onClick={() => hasEvent && handleEventClick(day.events[0])}
                                                            className={`
                                                              relative w-full aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all duration-200
                                ${day.isToday
                                                                    ? "border-2 border-[var(--bosphorus-emerald)]"
                                                                    : "bg-white/10 border border-white/10 hover:bg-white/15"
                                                                }
                                ${hasEvent ? "cursor-pointer group" : ""}
                              `}
                                                            style={day.isToday ? {
                                                                background: "radial-gradient(circle at center, rgba(0,77,64,0.5) 0%, rgba(0,77,64,0.15) 70%, transparent 100%)",
                                                                boxShadow: "0 0 20px rgba(0,77,64,0.35), inset 0 0 15px rgba(0,77,64,0.15)"
                                                            } : undefined}
                                                        >
                                                            {hasEvent ? (
                                                                <>
                                                                    <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
                                                                        <span className="text-sm font-bold text-white">{day.dayNumber}</span>
                                                                        <WeatherIcon type={day.weather} size="sm" />
                                                                    </div>
                                                                    <span
                                                                        className="text-xs text-center text-white font-semibold line-clamp-2 mt-3 px-1 transition-all duration-200 group-hover:text-[var(--warm-gold)]"
                                                                        style={{ fontFamily: "var(--font-heading)" }}
                                                                    >
                                                                        {day.events[0].title}
                                                                    </span>
                                                                    <div className="absolute inset-0 rounded-xl border-2 border-[var(--warm-gold)] opacity-40 group-hover:opacity-90 transition-opacity pointer-events-none" />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="text-2xl font-bold text-white">{day.dayNumber}</span>
                                                                    <WeatherIcon type={day.weather} size="md" />
                                                                </>
                                                            )}
                                                        </motion.div>

                                                        {/* Day Abbreviation */}
                                                        <span className={`text-xs font-semibold ${day.isToday ? "text-[var(--bosphorus-emerald-light)]" : "text-white/60"}`}>
                                                            {day.dayAbbr}
                                                        </span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            Array.from({ length: 7 }, (_, i) => (
                                                <div key={`skeleton-${i}`} className="flex flex-col items-center gap-1.5 pt-6">
                                                    <div className="w-full aspect-square rounded-xl bg-white/10 animate-pulse" />
                                                    <span className="text-xs text-white/30">---</span>
                                                </div>
                                            ))
                                        )}
                                    </motion.div>

                                    <button
                                        onClick={goToNext}
                                        className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                        aria-label="Sonraki hafta"
                                    >
                                        <ChevronRight className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Expand Button */}
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="w-full py-3 flex items-center justify-center hover:bg-white/5 transition-colors border-t border-white/5"
                            >
                                <motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronDown className="w-6 h-6 text-white/50" />
                                </motion.div>
                            </button>

                            {/* 8-Week Picker MEGA Grid */}
                            <AnimatePresence>
                                {isExpanded && hasMounted && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: "easeOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 py-5 border-t border-white/10">
                                            <p className="text-sm text-white/60 font-medium mb-4">Hafta Seçin</p>
                                            <div className="grid grid-cols-4 gap-4">
                                                {weeks.map((week, index) => (
                                                    <div key={index} className="relative pt-4">
                                                        {/* HD Floating Bu Haftadayız Pill */}
                                                        {week.isThisWeek && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 5 }}
                                                                animate={{ opacity: [0.8, 1, 0.8], y: 0 }}
                                                                transition={{ opacity: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }, y: { duration: 0.2 } }}
                                                                className="absolute -top-1 left-1/2 -translate-x-1/2 z-20"
                                                            >
                                                                <div className="backdrop-blur-md bg-[var(--bosphorus-emerald)]/80 border border-[var(--bosphorus-emerald)] px-3 py-1 rounded-full shadow-lg shadow-[var(--bosphorus-emerald)]/50">
                                                                    <span className="text-[10px] font-medium text-white whitespace-nowrap tracking-wide">
                                                                        Bu Haftadayız
                                                                    </span>
                                                                </div>
                                                            </motion.div>
                                                        )}

                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => handleWeekSelect(index)}
                                                            className={`
                                                              w-full py-5 px-4 rounded-xl text-center transition-all duration-200
                                ${week.isCurrentWeek
                                                                    ? "border-2 border-[var(--bosphorus-emerald)]"
                                                                    : week.isThisWeek
                                                                        ? "bg-white/15 border-2 border-white/30"
                                                                        : "bg-white/10 border border-white/10 hover:bg-white/15 hover:border-[var(--warm-gold)]/50"
                                                                }
                              `}
                                                            style={week.isThisWeek ? {
                                                                background: "radial-gradient(circle at center, rgba(0,77,64,0.4) 0%, rgba(0,77,64,0.12) 70%, rgba(255,255,255,0.08) 100%)",
                                                                boxShadow: "0 0 18px rgba(0,77,64,0.25), inset 0 0 12px rgba(0,77,64,0.12)"
                                                            } : undefined}
                                                        >
                                                            <span
                                                                className="block text-sm text-white/80 font-medium mb-1"
                                                                style={{ fontFamily: "var(--font-heading)" }}
                                                            >
                                                                {week.monthLabel}
                                                            </span>
                                                            <span className="block text-xl font-bold text-white">
                                                                {week.startDay} - {week.endDay}
                                                            </span>
                                                        </motion.button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
