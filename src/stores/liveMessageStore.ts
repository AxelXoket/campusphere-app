"use client";

import { RoleType } from "@/components/auth";

// =====================================================
// PERSISTENT MESSAGE STORE - localStorage backed
// =====================================================

export interface LiveMessage {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: string; // ISO 8601 format
    isFromMe: boolean;
}

// Storage key
const STORAGE_KEY = "campusphere_messages";

// Load messages from localStorage
function loadFromStorage(): Map<string, LiveMessage[]> {
    if (typeof window === "undefined") return new Map();

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return new Map(Object.entries(parsed));
        }
    } catch (e) {
        console.error("[MessageStore] Failed to load from localStorage:", e);
    }
    return new Map();
}

// Save messages to localStorage
function saveToStorage(store: Map<string, LiveMessage[]>): void {
    if (typeof window === "undefined") return;

    try {
        const obj = Object.fromEntries(store);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
        console.error("[MessageStore] Failed to save to localStorage:", e);
    }
}

// In-memory cache (lazy-loaded from localStorage)
let messageStore: Map<string, LiveMessage[]> | null = null;

function getStore(): Map<string, LiveMessage[]> {
    if (!messageStore) {
        messageStore = loadFromStorage();
    }
    return messageStore;
}

// =====================================================
// PUBLIC API
// =====================================================

// Get messages for a conversation
export function getMessages(conversationId: string): LiveMessage[] {
    const store = getStore();
    return store.get(conversationId) || [];
}

// Add a message to a conversation (persisted immediately)
export function addMessage(
    conversationId: string,
    message: Omit<LiveMessage, "id" | "timestamp">
): LiveMessage {
    const store = getStore();

    const newMessage: LiveMessage = {
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
    };

    const existing = store.get(conversationId) || [];
    store.set(conversationId, [...existing, newMessage]);

    // Persist immediately
    saveToStorage(store);

    console.log("[MessageStore] Added message to", conversationId, "- Total:", existing.length + 1);

    return newMessage;
}

// Clear messages for a specific conversation
export function clearConversationMessages(conversationId: string): void {
    const store = getStore();
    store.delete(conversationId);
    saveToStorage(store);
    console.log("[MessageStore] Cleared conversation:", conversationId);
}

// Clear all messages (for demo reset)
export function clearAllMessages(): void {
    const store = getStore();
    store.clear();
    saveToStorage(store);
    console.log("[MessageStore] Cleared all messages");
}

// =====================================================
// STABLE CONVERSATION ID GENERATOR
// =====================================================

// Generate a stable, deterministic ID for a DM pair
// This ensures the same pair of users ALWAYS get the same conversation ID
export function getStableConversationId(userId1: string, userId2: string): string {
    // Sort IDs to ensure consistency regardless of who initiates
    const sorted = [userId1, userId2].sort();
    return `dm-${sorted[0]}-${sorted[1]}`;
}

// =====================================================
// TIMESTAMP FORMATTING
// =====================================================

// Format ISO timestamp to display time (e.g., "15:30")
export function formatMessageTime(isoTimestamp: string): string {
    const date = new Date(isoTimestamp);
    return date.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Format for date separators (e.g., "Bugün", "Dün", "23 Aralık")
export function formatMessageDate(isoTimestamp: string): string {
    const date = new Date(isoTimestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
        return "Bugün";
    } else if (date.toDateString() === yesterday.toDateString()) {
        return "Dün";
    } else {
        return date.toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
        });
    }
}
