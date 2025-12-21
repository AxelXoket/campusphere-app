"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { mockConversations, MockConversation } from "@/data/mockMessages";
import { RoleType } from "@/components/auth";

interface ChatPanelProps {
    isOpen: boolean;
    onBack: () => void;
}

// Role border colors matching UserMarker
const roleBorderColors: Record<RoleType, string> = {
    ogrenci: "border-white",
    mezun: "border-[var(--warm-gold)]",
    akademisyen: "border-[var(--bosphorus-emerald)]",
};

/**
 * Chat Panel - Glassmorphism messaging interface
 * Shows list of conversations with avatars
 * Back button returns to Events list
 */
export function ChatPanel({ isOpen, onBack }: ChatPanelProps) {
    const [selectedConversation, setSelectedConversation] = useState<MockConversation | null>(null);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="h-full flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 p-4 border-b border-white/10">
                        <button
                            onClick={onBack}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-white/70" />
                        </button>
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-[var(--warm-gold)]" />
                            <h2 className="text-lg font-medium text-white" style={{ fontFamily: "var(--font-heading)" }}>
                                Mesajlar
                            </h2>
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto">
                        {selectedConversation ? (
                            <ChatDetail
                                conversation={selectedConversation}
                                onBack={() => setSelectedConversation(null)}
                            />
                        ) : (
                            <ConversationList
                                conversations={mockConversations}
                                onSelect={setSelectedConversation}
                            />
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function ConversationList({
    conversations,
    onSelect,
}: {
    conversations: MockConversation[];
    onSelect: (conv: MockConversation) => void;
}) {
    return (
        <div className="py-2">
            {conversations.map((conv, index) => (
                <motion.button
                    key={conv.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onSelect(conv)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors text-left"
                >
                    {/* Avatar with role border */}
                    <div className="relative">
                        <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${roleBorderColors[conv.participantRole]}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={conv.participantAvatar}
                                alt={conv.participantName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Online indicator */}
                        {conv.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-medium truncate">{conv.participantName}</span>
                            <span className="text-white/40 text-xs">{conv.lastMessageTime}</span>
                        </div>
                        <p className="text-white/50 text-sm truncate">{conv.lastMessage}</p>
                    </div>

                    {/* Unread badge */}
                    {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-[var(--warm-gold)] text-black text-xs font-bold rounded-full flex items-center justify-center">
                            {conv.unreadCount}
                        </span>
                    )}
                </motion.button>
            ))}
        </div>
    );
}

function ChatDetail({
    conversation,
    onBack,
}: {
    conversation: MockConversation;
    onBack: () => void;
}) {
    const [message, setMessage] = useState("");

    // Mock messages for this conversation
    const messages = [
        { id: "1", isMine: false, content: "Merhaba, yarınki seminere katılacak mısınız?", time: "14:30" },
        { id: "2", isMine: true, content: "Evet, kesinlikle katılacağım!", time: "14:32" },
        { id: "3", isMine: false, content: "Harika! Saat 14:00'te Avcılar Kampüsü'nde olacak.", time: "14:35" },
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10">
                <button
                    onClick={onBack}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-white/70" />
                </button>
                <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${roleBorderColors[conversation.participantRole]}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={conversation.participantAvatar}
                        alt={conversation.participantName}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div>
                    <p className="text-white font-medium">{conversation.participantName}</p>
                    <p className="text-white/50 text-xs">
                        {conversation.isOnline ? "Çevrimiçi" : "Çevrimdışı"}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] px-4 py-2 rounded-2xl ${msg.isMine
                                ? "bg-[var(--bosphorus-emerald)] text-white rounded-br-sm"
                                : "bg-white/10 text-white rounded-bl-sm"
                                }`}
                        >
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${msg.isMine ? "text-white/60" : "text-white/40"}`}>
                                {msg.time}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Mesaj yaz..."
                        className="flex-1 bg-white/10 text-white placeholder:text-white/40 px-4 py-3 rounded-full outline-none focus:bg-white/15 transition-colors"
                    />
                    <button className="w-11 h-11 grid place-items-center rounded-full bg-[var(--bosphorus-emerald)] text-white hover:bg-[var(--bosphorus-emerald-light)] transition-colors flex-shrink-0">
                        <Send className="w-5 h-5" style={{ transform: "rotate(-45deg)" }} />
                    </button>
                </div>
            </div>
        </div>
    );
}
