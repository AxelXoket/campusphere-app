"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, Briefcase, GraduationCap } from "lucide-react";

interface AnnouncementsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabType = "etkinlik" | "staj" | "is";

interface Announcement {
    id: string;
    title: string;
    subtitle: string;
    date: string;
    type: TabType;
}

// Mock announcements data - expanded for taller panel
const mockAnnouncements: Announcement[] = [
    // Etkinlik (Events)
    { id: "1", title: "Yapay Zeka Konferansı", subtitle: "Google Türkiye", date: "25 Aralık 2025", type: "etkinlik" },
    { id: "2", title: "Kariyer Günleri 2025", subtitle: "İÜ Kariyer Merkezi", date: "28 Aralık 2025", type: "etkinlik" },
    { id: "3", title: "Blockchain Workshop", subtitle: "Binance Academy", date: "2 Ocak 2026", type: "etkinlik" },
    { id: "4", title: "Startup Pitch Night", subtitle: "İTÜ ARI Teknokent", date: "5 Ocak 2026", type: "etkinlik" },
    { id: "5", title: "Web3 Hackathon", subtitle: "Ethereum Foundation", date: "10 Ocak 2026", type: "etkinlik" },
    // Staj (Internships)
    { id: "6", title: "Yazılım Geliştirici Stajyeri", subtitle: "Microsoft Türkiye", date: "Son Başvuru: 15 Ocak", type: "staj" },
    { id: "7", title: "Data Science Intern", subtitle: "Trendyol", date: "Son Başvuru: 20 Ocak", type: "staj" },
    { id: "8", title: "UX Design Stajı", subtitle: "Getir", date: "Son Başvuru: 25 Ocak", type: "staj" },
    { id: "9", title: "Backend Developer Intern", subtitle: "N11", date: "Son Başvuru: 30 Ocak", type: "staj" },
    { id: "10", title: "Mobile App Stajyeri", subtitle: "Yemeksepeti", date: "Son Başvuru: 5 Şubat", type: "staj" },
    // İş (Jobs)
    { id: "11", title: "Junior Full Stack Developer", subtitle: "Peak Games", date: "Tam Zamanlı", type: "is" },
    { id: "12", title: "DevOps Engineer", subtitle: "Insider", date: "Tam Zamanlı", type: "is" },
    { id: "13", title: "Product Manager", subtitle: "Dream Games", date: "Tam Zamanlı", type: "is" },
    { id: "14", title: "Senior Frontend Developer", subtitle: "Hepsiburada", date: "Tam Zamanlı", type: "is" },
    { id: "15", title: "Machine Learning Engineer", subtitle: "Turkcell", date: "Tam Zamanlı", type: "is" },
];

const tabs: { key: TabType; label: string; icon: typeof Calendar }[] = [
    { key: "etkinlik", label: "Etkinlik", icon: Calendar },
    { key: "staj", label: "Staj", icon: GraduationCap },
    { key: "is", label: "İş", icon: Briefcase },
];

export function AnnouncementsPanel({ isOpen, onClose }: AnnouncementsPanelProps) {
    const [activeTab, setActiveTab] = useState<TabType>("etkinlik");

    const filteredAnnouncements = mockAnnouncements.filter(a => a.type === activeTab);

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
                        className="fixed inset-0 z-40"
                    />

                    {/* Panel - Centered below megaphone icon with proper offset */}
                    <motion.div
                        initial={{ opacity: 0, y: -15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed top-20 left-1/2 z-50 w-[340px]"
                        style={{ marginLeft: "120px" }} // Offset to align with megaphone icon
                    >
                        <div className="backdrop-blur-xl bg-black/75 rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[70vh]">
                            {/* Header - Fixed z-index */}
                            <div className="relative z-20 px-5 pt-5 pb-4 flex items-center justify-between border-b border-white/10 bg-black/75 rounded-t-2xl">
                                <h3
                                    className="text-lg font-bold text-white"
                                    style={{ fontFamily: "var(--font-heading)" }}
                                >
                                    Duyurular
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4 text-white/70" />
                                </button>
                            </div>

                            {/* Triple Toggle - Higher z-index than content */}
                            <div className="relative z-10 px-4 py-3 bg-black/60">
                                <div className="flex bg-white/5 rounded-xl p-1">
                                    {tabs.map((tab) => {
                                        const isActive = activeTab === tab.key;
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.key}
                                                onClick={() => setActiveTab(tab.key)}
                                                className={`
                          flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg transition-all duration-200
                          ${isActive
                                                        ? "bg-[var(--bosphorus-emerald)] text-white shadow-lg"
                                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                                    }
                        `}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span
                                                    className={`text-xs font-medium ${isActive ? "font-semibold" : ""}`}
                                                    style={isActive ? { fontFamily: "var(--font-heading)" } : undefined}
                                                >
                                                    {tab.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Scrollable Content Area - Stable container */}
                            <div className="relative z-0 flex-1 px-4 pt-3 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                                <AnimatePresence mode="popLayout">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="space-y-3"
                                    >
                                        {filteredAnnouncements.map((announcement) => (
                                            <motion.div
                                                key={announcement.id}
                                                layout
                                                whileHover={{ scale: 1.02 }}
                                                className="p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-[var(--warm-gold)]/40 hover:shadow-lg hover:shadow-[var(--warm-gold)]/10 group"
                                            >
                                                <h4
                                                    className="text-sm font-semibold text-white group-hover:text-[var(--warm-gold)] transition-colors"
                                                    style={{ fontFamily: "var(--font-heading)" }}
                                                >
                                                    {announcement.title}
                                                </h4>
                                                <p className="text-xs text-white/60 mt-1">{announcement.subtitle}</p>
                                                <p className="text-xs text-white/40 mt-2">{announcement.date}</p>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Footer */}
                            <div className="relative z-10 px-4 py-3 border-t border-white/10 bg-black/60 rounded-b-2xl">
                                <button className="w-full py-2 text-xs text-white/50 hover:text-white/80 transition-colors">
                                    Tüm duyuruları görüntüle →
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
