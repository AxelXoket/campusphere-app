"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, ChevronDown, MapPin, Clock } from "lucide-react";
import { mockEvents, MockEvent } from "@/data/mockEvents";

interface CalendarDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    onEventClick: (event: MockEvent) => void;
}

// Turkish day names and months
const turkishDayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const turkishDayFull = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const turkishMonths = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

interface DayData {
    date: Date;
    dayNumber: number;
    dayName: string;
    dayNameFull: string;
    events: MockEvent[];
    isToday: boolean;
    isCurrentMonth: boolean;
}

// Get the Monday of a given week
function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Get weeks in a month (array of week start dates)
function getWeeksInMonth(year: number, month: number): Date[] {
    const weeks: Date[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let currentMonday = getMonday(firstDay);

    while (currentMonday <= lastDay) {
        weeks.push(new Date(currentMonday));
        currentMonday.setDate(currentMonday.getDate() + 7);
    }

    return weeks;
}

// Get days for a specific week
function getDaysForWeek(weekStart: Date, targetMonth: number): DayData[] {
    const days: DayData[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);

        const dayEvents = mockEvents.filter(event => {
            const eventDate = new Date(event.date);
            return (
                eventDate.getFullYear() === date.getFullYear() &&
                eventDate.getMonth() === date.getMonth() &&
                eventDate.getDate() === date.getDate()
            );
        });

        const isToday = date.getTime() === today.getTime();

        days.push({
            date,
            dayNumber: date.getDate(),
            dayName: turkishDayNames[i],
            dayNameFull: turkishDayFull[i],
            events: dayEvents,
            isToday,
            isCurrentMonth: date.getMonth() === targetMonth,
        });
    }

    return days;
}

// Event Popover Component - Fixed z-index and styling
function EventPopover({
    day,
    position,
    onEventClick,
    onClose,
}: {
    day: DayData;
    position: { x: number; y: number };
    onEventClick: (event: MockEvent) => void;
    onClose: () => void;
}) {
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.05 }}
            style={{
                position: "fixed",
                left: Math.min(position.x, window.innerWidth - 320),
                top: position.y + 12,
                zIndex: 9999, // CRITICAL: High z-index to appear above map
            }}
            className="w-72 backdrop-blur-xl bg-black/90 border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
        >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 bg-white/5">
                <p className="text-base font-semibold text-white">
                    {day.dayNumber} {turkishMonths[day.date.getMonth()]} - {day.dayNameFull}
                </p>
                <p className="text-sm text-white/50 mt-1">
                    {day.events.length} etkinlik
                </p>
            </div>

            {/* Events List */}
            <div className="max-h-56 overflow-y-auto">
                {day.events.map((event, idx) => (
                    <motion.button
                        type="button"
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event); // Parent handles all cleanup now
                        }}
                        className="w-full px-5 py-4 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 group"
                    >
                        <div className="flex items-center gap-2 text-[var(--warm-gold)] mb-1.5">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">{event.time}</span>
                        </div>
                        <p className="text-base font-medium text-white group-hover:text-[var(--warm-gold)] transition-colors line-clamp-1">
                            {event.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-white/50">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm line-clamp-1">{event.location}</span>
                        </div>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}

export function CalendarDropdown({ isOpen, onClose, onEventClick }: CalendarDropdownProps) {
    const [hasMounted, setHasMounted] = useState(false);

    // Current date references - memoized to prevent re-renders
    const today = useMemo(() => new Date(), []);
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // Lazy initialize selectedWeekIndex to the correct week containing today
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedWeekIndex, setSelectedWeekIndex] = useState(() => {
        const weeks = getWeeksInMonth(currentYear, currentMonth);
        const todayMonday = getMonday(new Date());
        const weekIdx = weeks.findIndex(w => w.getTime() === todayMonday.getTime());
        return weekIdx >= 0 ? weekIdx : 0;
    });

    // Dropdown states
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);

    // Animation direction for smooth slide transitions (+1 = next, -1 = prev)
    const [slideDirection, setSlideDirection] = useState(0);

    // Refs for click-outside detection
    const monthDropdownRef = useRef<HTMLDivElement>(null);
    const yearDropdownRef = useRef<HTMLDivElement>(null);

    // Popover state
    const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
    const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setHasMounted(true);
        setIsMobile(window.innerWidth < 768);

        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Click-outside handler for dropdowns
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            // Close month picker if clicking outside
            if (showMonthPicker && monthDropdownRef.current && !monthDropdownRef.current.contains(e.target as Node)) {
                setShowMonthPicker(false);
            }
            // Close year picker if clicking outside
            if (showYearPicker && yearDropdownRef.current && !yearDropdownRef.current.contains(e.target as Node)) {
                setShowYearPicker(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showMonthPicker, showYearPicker]);

    // Reset to current week when month changes (only when switching away from current month)
    useEffect(() => {
        // Find the week that contains today if we're in the current month
        if (selectedYear === currentYear && selectedMonth === currentMonth) {
            const weeksInMonth = getWeeksInMonth(selectedYear, selectedMonth);
            const todayMonday = getMonday(today);
            const weekIdx = weeksInMonth.findIndex(w => w.getTime() === todayMonday.getTime());
            if (weekIdx >= 0 && weekIdx !== selectedWeekIndex) {
                setSelectedWeekIndex(weekIdx);
            }
        } else {
            // Only reset if we're switching to a different month
            setSelectedWeekIndex(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMonth, selectedYear]);

    // Compute weeks for selected month
    const weeks = useMemo(() => {
        return getWeeksInMonth(selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth]);

    // Compute days for selected week
    const days = useMemo(() => {
        if (weeks.length === 0) return [];
        const weekStart = weeks[selectedWeekIndex] || weeks[0];
        return getDaysForWeek(weekStart, selectedMonth);
    }, [weeks, selectedWeekIndex, selectedMonth]);

    // Year options (±5 years)
    const yearOptions = useMemo(() => {
        const years: number[] = [];
        for (let y = currentYear - 2; y <= currentYear + 5; y++) {
            years.push(y);
        }
        return years;
    }, [currentYear]);

    // Navigation handlers
    const goToPrevMonth = () => {
        setSlideDirection(-1);
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(y => y - 1);
        } else {
            setSelectedMonth(m => m - 1);
        }
    };

    const goToNextMonth = () => {
        setSlideDirection(1);
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(y => y + 1);
        } else {
            setSelectedMonth(m => m + 1);
        }
    };

    // Handle week selection with direction
    const handleWeekSelect = (idx: number) => {
        setSlideDirection(idx > selectedWeekIndex ? 1 : -1);
        setSelectedWeekIndex(idx);
    };

    // Handle day click - opens popover
    const handleDayClick = useCallback((day: DayData, e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        // Always show popover on click, even if no events (shows "0 etkinlik")
        const rect = e.currentTarget.getBoundingClientRect();
        setPopoverPosition({
            x: rect.left + rect.width / 2 - 144, // Center the 288px popover
            y: rect.bottom,
        });
        setSelectedDay(day);
    }, []);

    // Close popover
    const closePopover = useCallback(() => {
        setSelectedDay(null);
    }, []);

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
                        className="fixed inset-0 z-[998]"
                    />

                    {/* Calendar Container - SCALED UP */}
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-[999] w-[95%] max-w-3xl"
                    >
                        <div className="backdrop-blur-xl bg-black/85 rounded-3xl border border-white/15 shadow-2xl overflow-hidden">

                            {/* HEADER: Month/Year Navigation - SCALED UP */}
                            <div className="px-6 pt-6 pb-5">
                                <div className="flex items-center justify-between">
                                    {/* Left: Chevron + Month/Year Dropdowns */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); goToPrevMonth(); }}
                                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                            aria-label="Önceki ay"
                                        >
                                            <ChevronLeft className="w-5 h-5 text-white" />
                                        </button>

                                        {/* Month Dropdown with click-outside */}
                                        <div className="relative" ref={monthDropdownRef}>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); }}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-white/10 transition-colors"
                                            >
                                                <span className="text-xl font-bold text-white">
                                                    {hasMounted ? turkishMonths[selectedMonth] : "---"}
                                                </span>
                                                <ChevronDown className={`w-5 h-5 text-white/60 transition-transform ${showMonthPicker ? "rotate-180" : ""}`} />
                                            </button>

                                            <AnimatePresence>
                                                {showMonthPicker && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                                        className="absolute top-full left-0 mt-2 p-4 backdrop-blur-xl bg-black/95 border border-white/15 rounded-2xl shadow-xl z-[1000] w-64"
                                                    >
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {turkishMonths.map((month, idx) => (
                                                                <button
                                                                    type="button"
                                                                    key={month}
                                                                    onClick={(e) => { e.stopPropagation(); setSelectedMonth(idx); setShowMonthPicker(false); }}
                                                                    className={`py-2.5 px-2 rounded-xl text-sm font-medium transition-all ${idx === selectedMonth
                                                                        ? "bg-[var(--bosphorus-emerald)] text-white"
                                                                        : idx === currentMonth && selectedYear === currentYear
                                                                            ? "bg-white/10 text-[var(--warm-gold)] border border-[var(--warm-gold)]/30"
                                                                            : "text-white/70 hover:bg-white/10 hover:text-white"
                                                                        }`}
                                                                >
                                                                    {month.substring(0, 3)}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Year Dropdown with click-outside */}
                                        <div className="relative" ref={yearDropdownRef}>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setShowYearPicker(!showYearPicker); setShowMonthPicker(false); }}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
                                            >
                                                <span className="text-xl font-bold text-white">
                                                    {hasMounted ? selectedYear : "----"}
                                                </span>
                                                <ChevronDown className={`w-5 h-5 text-white/60 transition-transform ${showYearPicker ? "rotate-180" : ""}`} />
                                            </button>

                                            <AnimatePresence>
                                                {showYearPicker && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                                        className="absolute top-full left-0 mt-2 p-3 backdrop-blur-xl bg-black/95 border border-white/15 rounded-xl shadow-xl z-[1000] max-h-56 overflow-y-auto"
                                                    >
                                                        {yearOptions.map(year => (
                                                            <button
                                                                type="button"
                                                                key={year}
                                                                onClick={(e) => { e.stopPropagation(); setSelectedYear(year); setShowYearPicker(false); }}
                                                                className={`w-full py-2.5 px-5 rounded-lg text-base font-medium text-left transition-all ${year === selectedYear
                                                                    ? "bg-[var(--bosphorus-emerald)] text-white"
                                                                    : year === currentYear
                                                                        ? "text-[var(--warm-gold)] hover:bg-white/10"
                                                                        : "text-white/70 hover:bg-white/10"
                                                                    }`}
                                                            >
                                                                {year}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); goToNextMonth(); }}
                                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                            aria-label="Sonraki ay"
                                        >
                                            <ChevronRight className="w-5 h-5 text-white" />
                                        </button>
                                    </div>

                                    {/* Right: Today Button - Enhanced with date display */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedMonth(currentMonth);
                                            setSelectedYear(currentYear);
                                        }}
                                        className="flex flex-col items-center px-5 py-2.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/40 hover:border-indigo-400/70 hover:from-indigo-500/30 hover:to-purple-500/30 transition-all group"
                                    >
                                        <span className="text-sm font-bold text-indigo-300 group-hover:text-indigo-200 transition-colors">
                                            Bugün
                                        </span>
                                        <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors mt-0.5">
                                            {hasMounted ? `${today.getDate()} ${turkishMonths[today.getMonth()].substring(0, 3)}` : "--"}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* TIER 1: Week Selector Chips - with smooth slide animation */}
                            <div className="px-6 pt-4 pb-5">
                                <AnimatePresence mode="popLayout" initial={false}>
                                    <motion.div
                                        key={`weeks-${selectedMonth}-${selectedYear}`}
                                        initial={{ x: slideDirection > 0 ? 50 : -50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: slideDirection > 0 ? -50 : 50, opacity: 0 }}
                                        transition={{ type: "tween", ease: "easeInOut", duration: 0.2 }}
                                        className="flex items-center gap-3 overflow-x-auto pt-4 pb-2 scrollbar-hide"
                                    >
                                        {weeks.map((weekStart, idx) => {
                                            const weekEnd = new Date(weekStart);
                                            weekEnd.setDate(weekStart.getDate() + 6);

                                            const isSelected = idx === selectedWeekIndex;
                                            const todayMonday = getMonday(today);
                                            const isThisWeek = weekStart.getTime() === todayMonday.getTime();

                                            return (
                                                <motion.button
                                                    type="button"
                                                    key={idx}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={(e) => { e.stopPropagation(); handleWeekSelect(idx); }}
                                                    className={`relative flex-shrink-0 px-5 py-3.5 rounded-xl text-base font-medium transition-all ${isSelected
                                                        ? "bg-[var(--bosphorus-emerald)] text-white shadow-lg shadow-[var(--bosphorus-emerald)]/30"
                                                        : isThisWeek
                                                            ? "bg-white/15 text-white border border-[var(--bosphorus-emerald)]/50"
                                                            : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                                                        }`}
                                                >
                                                    {isThisWeek && !isSelected && (
                                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-white bg-[var(--bosphorus-emerald)] px-2 py-0.5 rounded-full shadow-lg z-20">
                                                            Bu Hafta
                                                        </span>
                                                    )}
                                                    <span className="block text-sm text-white/60 mb-1">Hafta {idx + 1}</span>
                                                    <span className="block font-semibold text-lg">
                                                        {weekStart.getDate()} - {weekEnd.getDate()}
                                                    </span>
                                                </motion.button>
                                            );
                                        })}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* TIER 2: 7-Day Grid - with smooth slide animation */}
                            <div className="px-6 pt-4 pb-6">
                                <AnimatePresence mode="popLayout" initial={false}>
                                    <motion.div
                                        key={`${selectedMonth}-${selectedWeekIndex}`}
                                        initial={{ x: slideDirection > 0 ? 50 : -50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: slideDirection > 0 ? -50 : 50, opacity: 0 }}
                                        transition={{ type: "tween", ease: "easeInOut", duration: 0.2 }}
                                        className="grid grid-cols-7 gap-4"
                                    >
                                        {days.map((day, idx) => {
                                            const hasEvents = day.events.length > 0;

                                            return (
                                                <motion.div
                                                    key={day.date.toISOString()}
                                                    initial={false}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    onClick={(e) => { e.stopPropagation(); handleDayClick(day, e); }}
                                                    className={`
                                                        relative aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer
                                                        transition-all duration-200 min-h-[80px] pb-4 hover:z-10 hover:scale-105
                                                        ${day.isToday
                                                            ? "ring-2 ring-[var(--bosphorus-emerald)] bg-gradient-to-br from-[var(--bosphorus-emerald)]/30 to-transparent"
                                                            : day.isCurrentMonth
                                                                ? "bg-white/10 hover:bg-white/20"
                                                                : "bg-white/5 opacity-50"
                                                        }
                                                        ${hasEvents ? "hover:ring-2 hover:ring-[var(--warm-gold)]/50" : ""}
                                                    `}
                                                >
                                                    {/* "Bugün" Pill */}
                                                    {day.isToday && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 3 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"
                                                        >
                                                            <div className="bg-[var(--bosphorus-emerald)] text-[10px] font-semibold text-white px-2.5 py-1 rounded-full shadow-lg">
                                                                Bugün
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    {/* Day Number - SCALED UP */}
                                                    <span className={`text-2xl font-bold ${day.isToday
                                                        ? "text-[var(--bosphorus-emerald-light)]"
                                                        : day.isCurrentMonth
                                                            ? "text-white"
                                                            : "text-white/40"
                                                        }`}>
                                                        {day.dayNumber}
                                                    </span>

                                                    {/* Day Name - SCALED UP */}
                                                    <span className={`text-sm font-medium mt-1 ${day.isToday
                                                        ? "text-[var(--bosphorus-emerald-light)]"
                                                        : "text-white/50"
                                                        }`}>
                                                        {day.dayName}
                                                    </span>

                                                    {/* Event Indicator Dots - SCALED UP */}
                                                    {hasEvents && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1"
                                                        >
                                                            {day.events.slice(0, 3).map((_, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={`w-2 h-2 rounded-full ${i === 0
                                                                        ? "bg-[var(--warm-gold)]"
                                                                        : i === 1
                                                                            ? "bg-indigo-400"
                                                                            : "bg-pink-400"
                                                                        }`}
                                                                />
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>

                    {/* Event Popover - NO AnimatePresence for instant close */}
                    {selectedDay && (
                        <EventPopover
                            day={selectedDay}
                            position={popoverPosition}
                            onEventClick={(event) => {
                                // CLEAN SWEEP: Clear popover FIRST, then close calendar, then open event
                                setSelectedDay(null); // 1. Kill popover state immediately
                                onClose(); // 2. Close the calendar dropdown
                                onEventClick(event); // 3. Open event details
                            }}
                            onClose={closePopover}
                        />
                    )}
                </>
            )}
        </AnimatePresence>
    );
}
