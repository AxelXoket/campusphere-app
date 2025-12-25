"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, Settings, LogOut, X, Calendar, MessageCircle, Heart, Trophy, ChevronDown, User, Mail, Lock, Camera } from "lucide-react";
import { useMockAuth } from "@/lib/MockAuthContext";

interface UserActionDockProps {
    avatar: string;
    onProfileClick: () => void;
}

/**
 * Top-right user avatar with dropdown menu
 * Click avatar to toggle dropdown with Stats, Settings, Logout
 */
export function UserActionDock({ avatar, onProfileClick }: UserActionDockProps) {
    const { logout, user } = useMockAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMenuItemClick = (action: () => void) => {
        action();
        setIsMenuOpen(false);
    };

    return (
        <>
            <motion.div
                ref={menuRef}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 right-4 z-30"
            >
                {/* Avatar Button */}
                <motion.button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/50 transition-all shadow-lg backdrop-blur-md bg-black/40"
                >
                    <img
                        src={avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute top-full right-0 mt-2 w-56 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                        >
                            {/* User Info Header */}
                            <div className="p-4 border-b border-white/10">
                                <p className="text-white font-medium truncate">{user?.name || "Demo User"}</p>
                                <p className="text-white/50 text-sm truncate">{user?.email || "demo@campusphere.com"}</p>
                            </div>

                            {/* Menu Items */}
                            <div className="py-2">
                                <MenuItem
                                    icon={LayoutDashboard}
                                    label="İstatistikler"
                                    onClick={() => handleMenuItemClick(() => setIsDashboardOpen(true))}
                                />
                                <MenuItem
                                    icon={Settings}
                                    label="Ayarlar"
                                    onClick={() => handleMenuItemClick(() => setIsSettingsOpen(true))}
                                />
                                <div className="h-px bg-white/10 my-2" />
                                <MenuItem
                                    icon={LogOut}
                                    label="Çıkış Yap"
                                    onClick={() => handleMenuItemClick(logout)}
                                    variant="danger"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Activity Dashboard Modal */}
            <ActivityDashboardModal
                isOpen={isDashboardOpen}
                onClose={() => setIsDashboardOpen(false)}
                userName={user?.name || "Demo User"}
            />

            {/* Settings Modal */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </>
    );
}

/**
 * Dropdown menu item
 */
function MenuItem({
    icon: Icon,
    label,
    onClick,
    variant = "default",
}: {
    icon: typeof LayoutDashboard;
    label: string;
    onClick: () => void;
    variant?: "default" | "danger";
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${variant === "danger"
                    ? "text-red-400 hover:bg-red-500/10"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
        >
            <Icon className="w-4 h-4" />
            <span className="text-sm">{label}</span>
        </button>
    );
}

/**
 * Activity Dashboard Modal with gamification stats
 */
function ActivityDashboardModal({
    isOpen,
    onClose,
    userName,
}: {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
}) {
    // Mock gamification data
    const stats = {
        totalEvents: 12,
        peopleChattedWith: 48,
        bestie: "Ahmet Y.",
        rank: "Sosyal Kelebek 🦋",
        streak: 7,
        badges: [] as string[], // Empty for now to show empty state
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.4 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-lg bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/10">
                            <div>
                                <h2 className="text-lg font-heading text-white">
                                    Aktivite Paneli
                                </h2>
                                <p className="text-sm text-white/50">Merhaba, {userName}!</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Stats Grid */}
                        <div className="p-5 grid grid-cols-2 gap-4">
                            {/* Total Events */}
                            <StatCard
                                icon={Calendar}
                                value={stats.totalEvents}
                                label="Katıldığın Etkinlik"
                                color="indigo"
                            />

                            {/* People Chatted With */}
                            <StatCard
                                icon={MessageCircle}
                                value={stats.peopleChattedWith}
                                label="Kişiyle Sohbet"
                                color="emerald"
                            />

                            {/* Bestie */}
                            <div className="col-span-2 p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                                        <Heart className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/60">Favori Sohbet</p>
                                        <p className="text-lg font-semibold text-white">
                                            En çok <span className="text-pink-400">{stats.bestie}</span> ile konuştun
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Badges Section */}
                            <div className="col-span-2 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                        <Trophy className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/60">Rozetler</p>
                                        <p className="text-lg font-semibold text-white">{stats.rank}</p>
                                    </div>
                                </div>
                                {stats.badges.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-2">
                                        Henüz rozet edinilmedi
                                    </p>
                                )}
                            </div>

                            {/* Streak */}
                            <div className="col-span-2 text-center py-3">
                                <p className="text-white/50 text-sm">
                                    🔥 <span className="text-orange-400 font-semibold">{stats.streak} gün</span> üst üste aktifsin!
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/**
 * Stat card component for dashboard
 */
function StatCard({
    icon: Icon,
    value,
    label,
    color,
}: {
    icon: typeof Calendar;
    value: number;
    label: string;
    color: "indigo" | "emerald";
}) {
    const colorClasses = {
        indigo: "from-indigo-500/10 to-blue-500/10 border-indigo-500/20",
        emerald: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20",
    };

    const iconColors = {
        indigo: "from-indigo-500 to-blue-600",
        emerald: "from-emerald-500 to-teal-600",
    };

    return (
        <div className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} border`}>
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${iconColors[color]} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="text-xs text-white/60">{label}</p>
                </div>
            </div>
        </div>
    );
}

/**
 * Settings Modal - Account Management
 */
function SettingsModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const { user } = useMockAuth();
    const [username, setUsername] = useState(user?.name || "Demo Kullanıcı");
    const [email, setEmail] = useState(user?.email || "demo@campusphere.com");
    const [password, setPassword] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.4 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/10">
                            <h2 className="text-lg font-heading text-white">Hesap Ayarları</h2>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-5">
                            {/* Profile Photo */}
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20">
                                        <img
                                            src={user?.email?.includes("akademisyen")
                                                ? "https://i.pravatar.cc/150?img=60"
                                                : user?.email?.includes("mezun")
                                                    ? "https://i.pravatar.cc/150?img=33"
                                                    : "https://i.pravatar.cc/150?img=12"}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 transition-colors">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-xs text-white/40 mt-2">Fotoğrafı değiştir</p>
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1.5">
                                    <User className="w-4 h-4 inline mr-1" />
                                    Kullanıcı Adı
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1.5">
                                    <Mail className="w-4 h-4 inline mr-1" />
                                    E-posta
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1.5">
                                    <Lock className="w-4 h-4 inline mr-1" />
                                    Yeni Şifre
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                />
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
