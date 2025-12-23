"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Send, MessageCircle, Users, MoreVertical, Trash2, LogOut, X } from "lucide-react";
import {
    MockConversation,
    getUserVisibleChannels,
    EventGroupChannel,
    getEventChannelById,
    getAllActiveConversations,
    isConversationCleared,
    clearConversation,
    deleteConversation,
    leaveEventChannel,
    updateConversationPreview,
} from "@/data/mockMessages";
import { RoleType } from "@/components/auth";

interface ChatPanelProps {
    isOpen: boolean;
    onBack: () => void;
    activeChannelId?: string | null;
    onOpenProfile?: (userId: string) => void;
}

// Role border colors matching UserMarker
const roleBorderColors: Record<RoleType, string> = {
    ogrenci: "border-white",
    mezun: "border-[var(--warm-gold)]",
    akademisyen: "border-[var(--bosphorus-emerald)]",
};

// Union type for chat items (DM or Group)
type ChatItem =
    | { type: "dm"; data: MockConversation }
    | { type: "group"; data: EventGroupChannel };

// Confirmation Modal Component
function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText,
    onConfirm,
    onCancel,
    isDestructive = false,
}: {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDestructive?: boolean;
}) {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black/90 border border-white/10 rounded-2xl p-6 mx-4 max-w-sm w-full"
            >
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-white/60 text-sm mb-6">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2.5 rounded-xl transition-colors ${isDestructive
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-[var(--bosphorus-emerald)] text-white hover:bg-[var(--bosphorus-emerald-light)]"
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

/**
 * Chat Panel - Glassmorphism messaging interface
 * Shows: Event Group Channels (approved) + Direct Messages
 * Features: Options menu for Clear/Delete/Leave actions
 */
export function ChatPanel({ isOpen, onBack, activeChannelId, onOpenProfile }: ChatPanelProps) {
    const [selectedItem, setSelectedItem] = useState<ChatItem | null>(null);
    const [eventChannels, setEventChannels] = useState<EventGroupChannel[]>([]);
    const [conversations, setConversations] = useState<MockConversation[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    // Load data
    useEffect(() => {
        setEventChannels(getUserVisibleChannels());
        setConversations(getAllActiveConversations());
    }, [isOpen, refreshKey]);

    // Auto-select channel/conversation if activeChannelId is provided
    useEffect(() => {
        if (activeChannelId && isOpen) {
            // First check event group channels
            const channel = getEventChannelById(activeChannelId);
            if (channel) {
                setSelectedItem({ type: "group", data: channel });
                return;
            }

            // Then check DM conversations (by conversation ID)
            const allConvs = getAllActiveConversations();
            const conversation = allConvs.find(c => c.id === activeChannelId);
            if (conversation) {
                setSelectedItem({ type: "dm", data: conversation });
                return;
            }
        }
    }, [activeChannelId, isOpen]);

    // Handle back from chat detail
    const handleBackFromDetail = () => {
        setSelectedItem(null);
        setRefreshKey(k => k + 1); // Refresh list
    };

    // Combined chat list: Event Groups first, then DMs
    const chatItems: ChatItem[] = [
        ...eventChannels.map(ch => ({ type: "group" as const, data: ch })),
        ...conversations.map(conv => ({ type: "dm" as const, data: conv })),
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="h-full flex flex-col relative"
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 p-4 border-b border-white/10">
                        <button
                            onClick={selectedItem ? handleBackFromDetail : onBack}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-white/70" />
                        </button>
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-[var(--warm-gold)]" />
                            <h2 className="text-lg font-medium text-white" style={{ fontFamily: "var(--font-heading)" }}>
                                {selectedItem
                                    ? (selectedItem.type === "group" ? selectedItem.data.name : selectedItem.data.participantName)
                                    : "Mesajlar"
                                }
                            </h2>
                        </div>
                    </div>

                    {/* Content with Slide Animations */}
                    <div className="flex-1 overflow-hidden relative">
                        <AnimatePresence mode="wait">
                            {selectedItem ? (
                                <motion.div
                                    key={selectedItem.data.id}
                                    initial={{ opacity: 0, x: 24 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 24 }}
                                    transition={{
                                        type: "tween",
                                        duration: 0.3,
                                        ease: [0.25, 0.1, 0.25, 1], // ease-out
                                        delay: 0.075, // 75ms stagger after panel
                                    }}
                                    className="absolute inset-0 overflow-y-auto"
                                >
                                    {selectedItem.type === "group" ? (
                                        <GroupChatDetail
                                            channel={selectedItem.data}
                                            onLeave={() => {
                                                leaveEventChannel(selectedItem.data.id);
                                                handleBackFromDetail();
                                            }}
                                        />
                                    ) : (
                                        <ChatDetail
                                            conversation={selectedItem.data}
                                            onBack={handleBackFromDetail}
                                            onClear={() => {
                                                clearConversation(selectedItem.data.id);
                                                setRefreshKey(k => k + 1);
                                            }}
                                            onDelete={() => {
                                                deleteConversation(selectedItem.data.id);
                                                handleBackFromDetail();
                                            }}
                                            onOpenProfile={onOpenProfile}
                                        />
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="chat-list"
                                    initial={{ opacity: 0, x: -24 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -24 }}
                                    transition={{
                                        type: "tween",
                                        duration: 0.3,
                                        ease: [0.25, 0.1, 0.25, 1], // ease-out
                                    }}
                                    className="absolute inset-0 overflow-y-auto"
                                >
                                    <ChatList
                                        items={chatItems}
                                        onSelect={setSelectedItem}
                                        onClearDm={(convId) => {
                                            clearConversation(convId);
                                            setRefreshKey(k => k + 1);
                                        }}
                                        onDeleteDm={(convId) => {
                                            deleteConversation(convId);
                                            setRefreshKey(k => k + 1);
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Combined Chat List showing groups and DMs with context menus
function ChatList({
    items,
    onSelect,
    onClearDm,
    onDeleteDm,
}: {
    items: ChatItem[];
    onSelect: (item: ChatItem) => void;
    onClearDm?: (conversationId: string) => void;
    onDeleteDm?: (conversationId: string) => void;
}) {
    const groups = items.filter(i => i.type === "group");
    const dms = items.filter(i => i.type === "dm");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    return (
        <div className="py-2">
            {/* Event Group Channels Section */}
            {groups.length > 0 && (
                <>
                    <div className="px-4 py-2 text-xs text-[var(--bosphorus-emerald)] font-medium uppercase tracking-wider">
                        Etkinlik Grupları
                    </div>
                    {groups.map((item, index) => (
                        <motion.button
                            key={item.data.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => onSelect(item)}
                            className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors text-left border-l-2 border-[var(--bosphorus-emerald)]"
                        >
                            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[var(--bosphorus-emerald)] bg-[var(--bosphorus-emerald)]/20 flex items-center justify-center">
                                {item.data.avatar ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={item.data.avatar} alt={item.data.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Users className="w-6 h-6 text-[var(--bosphorus-emerald)]" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium truncate">{item.data.name}</h3>
                                <p className="text-white/50 text-sm truncate">{item.data.lastMessage}</p>
                            </div>
                            <span className="text-xs text-white/40">{item.data.lastMessageTime}</span>
                        </motion.button>
                    ))}
                </>
            )}

            {/* Direct Messages Section with Context Menus */}
            {dms.length > 0 && (
                <>
                    <div className="px-4 py-2 mt-2 text-xs text-white/50 font-medium uppercase tracking-wider">
                        Direkt Mesajlar
                    </div>
                    {dms.map((item, index) => {
                        const conv = item.data as MockConversation;
                        const isMenuOpen = openMenuId === conv.id;
                        return (
                            <motion.div
                                key={conv.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: (groups.length + index) * 0.05 }}
                                className="relative group"
                            >
                                <button
                                    onClick={() => onSelect(item)}
                                    className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors text-left pr-12"
                                >
                                    <div className="relative">
                                        <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${roleBorderColors[conv.participantRole]}`}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={conv.participantAvatar} alt={conv.participantName} className="w-full h-full object-cover" />
                                        </div>
                                        {conv.isOnline && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[var(--bosphorus-emerald)] rounded-full border-2 border-black" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-white font-medium truncate">{conv.participantName}</h3>
                                            <span className="text-xs text-white/40">{conv.lastMessageTime}</span>
                                        </div>
                                        <p className="text-white/50 text-sm truncate">{conv.lastMessage}</p>
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <div className="w-5 h-5 bg-[var(--warm-gold)] rounded-full flex items-center justify-center">
                                            <span className="text-black text-xs font-bold">{conv.unreadCount}</span>
                                        </div>
                                    )}
                                </button>

                                {/* Kebab Menu Button */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(isMenuOpen ? null : conv.id); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                                >
                                    <MoreVertical className="w-4 h-4 text-white/50" />
                                </button>

                                {/* Context Menu Dropdown */}
                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className="absolute right-2 top-14 bg-black/95 border border-white/10 rounded-xl overflow-hidden shadow-xl z-20 min-w-[150px]"
                                    >
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); onClearDm?.(conv.id); }}
                                            className="flex items-center gap-2 px-4 py-3 hover:bg-white/10 transition-colors w-full text-left text-white/70"
                                        >
                                            <X className="w-4 h-4" />
                                            <span className="text-sm">Temizle</span>
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); onDeleteDm?.(conv.id); }}
                                            className="flex items-center gap-2 px-4 py-3 hover:bg-red-500/20 transition-colors w-full text-left text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="text-sm">Sil</span>
                                        </button>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </>
            )}

            {/* Empty State */}
            {items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-white/40">
                    <MessageCircle className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm">Henüz mesaj yok</p>
                    <p className="text-xs mt-1">Bir etkinliğe katılarak sohbet başlatın</p>
                </div>
            )}
        </div>
    );
}

// Event Group Chat Detail View with Leave Option
function GroupChatDetail({ channel, onLeave }: { channel: EventGroupChannel; onLeave: () => void }) {
    const [message, setMessage] = useState("");
    const [showMenu, setShowMenu] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div className="h-full flex flex-col relative">
            {/* Group Info Banner with Options Menu */}
            <div className="p-4 bg-[var(--bosphorus-emerald)]/10 border-b border-[var(--bosphorus-emerald)]/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[var(--bosphorus-emerald)]" />
                    <div>
                        <p className="text-sm text-[var(--bosphorus-emerald)]">Etkinlik Sohbet Grubu</p>
                        <p className="text-xs text-white/50">Organizatör: {channel.organizerName}</p>
                    </div>
                </div>

                {/* Options Menu Button */}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                    >
                        <MoreVertical className="w-5 h-5 text-white/70" />
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute right-0 top-10 bg-black/90 border border-white/10 rounded-xl overflow-hidden shadow-xl z-10"
                        >
                            <button
                                onClick={() => {
                                    setShowMenu(false);
                                    setShowConfirm(true);
                                }}
                                className="flex items-center gap-2 px-4 py-3 hover:bg-red-500/20 transition-colors w-full text-left text-red-400"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm">Gruptan Çık</span>
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col items-center justify-center h-full text-white/40">
                    <Users className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm">Gruba hoş geldiniz!</p>
                    <p className="text-xs mt-1">İlk mesajı siz gönderin</p>
                </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Mesaj yazın..."
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[var(--bosphorus-emerald)]/50"
                    />
                    <button className="w-12 h-12 flex items-center justify-center bg-[var(--bosphorus-emerald)] rounded-xl hover:bg-[var(--bosphorus-emerald-light)] transition-colors">
                        <Send className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={showConfirm}
                title="Gruptan Çık"
                message="Bu gruptan çıkmak istediğinize emin misiniz? Tekrar katılmak için etkinliğe yeniden başvurmanız gerekecek."
                confirmText="Çık"
                isDestructive
                onConfirm={() => {
                    setShowConfirm(false);
                    onLeave();
                }}
                onCancel={() => setShowConfirm(false)}
            />
        </div>
    );
}

// DM Chat Detail with LIVE AI Integration
function ChatDetail({
    conversation,
    onBack,
    onClear,
    onDelete,
    onOpenProfile,
}: {
    conversation: MockConversation;
    onBack: () => void;
    onClear: () => void;
    onDelete: () => void;
    onOpenProfile?: (userId: string) => void;
}) {
    const [message, setMessage] = useState("");
    const [showMenu, setShowMenu] = useState(false);
    const [confirmAction, setConfirmAction] = useState<"clear" | "delete" | null>(null);
    const [isCleared, setIsCleared] = useState(isConversationCleared(conversation.id));
    const [liveMessages, setLiveMessages] = useState<Array<{
        id: string;
        isMe: boolean;
        content: string;
        time: string;
    }>>([]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        if (showMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showMenu]);

    // Format timestamp to display time
    const formatTime = (isoTimestamp: string): string => {
        const date = new Date(isoTimestamp);
        return date.toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Load messages from persistent store on mount
    useEffect(() => {
        // Dynamic import to avoid SSR issues
        import("@/stores/liveMessageStore").then(({ getMessages, formatMessageTime }) => {
            const storedMessages = getMessages(conversation.id);
            if (storedMessages.length > 0) {
                const formatted = storedMessages.map(msg => ({
                    id: msg.id,
                    isMe: msg.isFromMe,
                    content: msg.content,
                    time: formatMessageTime(msg.timestamp),
                }));
                setLiveMessages(formatted);
                console.log("[ChatDetail] Loaded", formatted.length, "messages from store");
            }
        });
    }, [conversation.id]);

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [liveMessages, isTyping]);

    // Handle sending message with AI reply (persisted to store)
    const handleSendMessage = async () => {
        if (!message.trim()) return;

        const userContent = message.trim();
        setMessage("");

        // Import store functions dynamically
        const { addMessage } = await import("@/stores/liveMessageStore");

        // Add user message to persistent store AND local state
        const userTimestamp = new Date().toISOString();
        addMessage(conversation.id, {
            conversationId: conversation.id,
            senderId: "current-user",
            senderName: "Ben",
            content: userContent,
            isFromMe: true,
        });

        setLiveMessages(prev => [...prev, {
            id: `msg-${Date.now()}`,
            isMe: true,
            content: userContent,
            time: formatTime(userTimestamp),
        }]);

        // Show typing indicator
        setIsTyping(true);

        try {
            // Call AI API
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userContent,
                    persona: {
                        name: conversation.participantName,
                        role: conversation.participantRole,
                        department: undefined,
                    },
                }),
            });

            const data = await response.json();

            // Add AI reply to persistent store AND local state
            addMessage(conversation.id, {
                conversationId: conversation.id,
                senderId: conversation.participantId,
                senderName: conversation.participantName,
                content: data.reply,
                isFromMe: false,
            });

            // Update sidebar preview with AI reply (latest message)
            updateConversationPreview(conversation.id, data.reply);

            setLiveMessages(prev => [...prev, {
                id: `msg-ai-${Date.now()}`,
                isMe: false,
                content: data.reply,
                time: formatTime(data.timestamp || new Date().toISOString()),
            }]);
        } catch (error) {
            console.error("Failed to get AI reply:", error);
            // Fallback message (also persisted)
            addMessage(conversation.id, {
                conversationId: conversation.id,
                senderId: conversation.participantId,
                senderName: conversation.participantName,
                content: "Şu an yanıt veremiyorum, daha sonra tekrar deneyelim.",
                isFromMe: false,
            });

            setLiveMessages(prev => [...prev, {
                id: `msg-error-${Date.now()}`,
                isMe: false,
                content: "Şu an yanıt veremiyorum, daha sonra tekrar deneyelim.",
                time: formatTime(new Date().toISOString()),
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    // Handle Enter key
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // All messages from live state (loaded from store + new)
    const allMessages = liveMessages;

    return (
        <div className="h-full flex flex-col relative">
            {/* Header with Avatar and Options Menu - CLICKABLE for Profile */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-black/30">
                <button
                    onClick={() => {
                        console.log("[ChatDetail] Avatar clicked, participantId:", conversation.participantId);
                        console.log("[ChatDetail] onOpenProfile defined:", !!onOpenProfile);
                        if (onOpenProfile) {
                            onOpenProfile(conversation.participantId);
                        } else {
                            console.error("[ChatDetail] onOpenProfile is undefined!");
                        }
                    }}
                    className="relative cursor-pointer hover:opacity-80 transition-opacity"
                >
                    <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${roleBorderColors[conversation.participantRole]}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={conversation.participantAvatar} alt={conversation.participantName} className="w-full h-full object-cover" />
                    </div>
                    {conversation.isOnline && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[var(--bosphorus-emerald)] rounded-full border-2 border-black" />
                    )}
                </button>
                <button
                    onClick={() => onOpenProfile?.(conversation.participantId)}
                    className="flex-1 text-left cursor-pointer hover:opacity-80 transition-opacity"
                >
                    <h3 className="text-white font-medium text-sm">{conversation.participantName}</h3>
                    <p className="text-xs text-white/50">
                        {isTyping ? (
                            <span className="text-[var(--bosphorus-emerald)] animate-pulse">Yazıyor...</span>
                        ) : (
                            conversation.isOnline ? "Çevrimiçi" : "Çevrimdışı"
                        )}
                    </p>
                </button>

                {/* Options Menu */}
                <div ref={menuRef} className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                    >
                        <MoreVertical className="w-5 h-5 text-white/70" />
                    </button>

                    <AnimatePresence>
                        {showMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="absolute right-0 top-10 bg-black/90 border border-white/10 rounded-xl overflow-hidden shadow-xl z-10 min-w-[160px] origin-top-right"
                            >
                                <button
                                    onClick={() => { setShowMenu(false); setConfirmAction("clear"); }}
                                    className="flex items-center gap-2 px-4 py-3 hover:bg-white/10 transition-colors w-full text-left text-white/70"
                                >
                                    <X className="w-4 h-4" />
                                    <span className="text-sm">Sohbeti Temizle</span>
                                </button>
                                <button
                                    onClick={() => { setShowMenu(false); setConfirmAction("delete"); }}
                                    className="flex items-center gap-2 px-4 py-3 hover:bg-red-500/20 transition-colors w-full text-left text-red-400"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="text-sm">Sohbeti Sil</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Message History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {allMessages.length > 0 ? (
                    <>
                        {allMessages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${msg.isMe
                                    ? "bg-[var(--bosphorus-emerald)] text-white rounded-br-md"
                                    : "bg-white/10 text-white rounded-bl-md"
                                    }`}>
                                    <p className="text-sm">{msg.content}</p>
                                    <p className={`text-xs mt-1 ${msg.isMe ? "text-white/70" : "text-white/40"}`}>{msg.time}</p>
                                </div>
                            </div>
                        ))}
                        {/* Typing Indicator Bubble */}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white/10 text-white rounded-2xl rounded-bl-md px-4 py-3">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white/40">
                        <MessageCircle className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-sm">Sohbete başlayın</p>
                    </div>
                )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Mesaj yazın..."
                        disabled={isTyping}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[var(--bosphorus-emerald)]/50 disabled:opacity-50"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isTyping || !message.trim()}
                        className="w-12 h-12 flex items-center justify-center bg-[var(--bosphorus-emerald)] rounded-xl hover:bg-[var(--bosphorus-emerald-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Confirmation Modals */}
            <ConfirmModal
                isOpen={confirmAction === "clear"}
                title="Sohbeti Temizle"
                message="Tüm mesaj geçmişi silinecek. Bu işlem geri alınamaz."
                confirmText="Temizle"
                isDestructive
                onConfirm={() => {
                    setConfirmAction(null);
                    setIsCleared(true);
                    setLiveMessages([]);
                    onClear();
                }}
                onCancel={() => setConfirmAction(null)}
            />
            <ConfirmModal
                isOpen={confirmAction === "delete"}
                title="Sohbeti Sil"
                message="Bu sohbet tamamen silinecek ve listeden kaldırılacak."
                confirmText="Sil"
                isDestructive
                onConfirm={() => {
                    setConfirmAction(null);
                    onDelete();
                }}
                onCancel={() => setConfirmAction(null)}
            />
        </div>
    );
}
