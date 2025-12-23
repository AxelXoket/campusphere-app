/**
 * Event Channels Store - Auto-generated chat channels for events
 * Each event automatically gets a corresponding locked chat channel
 */

import { mockEvents, MockEvent } from "@/data/mockEvents";

export interface EventChannel {
    id: string;
    eventId: string;
    type: "group";
    name: string;
    isLocked: boolean;
    organizerId: string;
    members: string[]; // User IDs who have access
    messages: ChatMessage[];
    createdAt: Date;
}

export interface ChatMessage {
    id: string;
    channelId: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: Date;
}

// In-memory channel store
let eventChannels: Map<string, EventChannel> = new Map();

// Initialize channels on module load
function initializeChannels() {
    mockEvents.forEach(event => {
        createEventChannel(event);
    });
}

/**
 * Create a chat channel for an event
 */
export function createEventChannel(event: MockEvent): EventChannel {
    const channelId = `channel-${event.id}`;

    // Don't recreate if exists
    if (eventChannels.has(channelId)) {
        return eventChannels.get(channelId)!;
    }

    const channel: EventChannel = {
        id: channelId,
        eventId: event.id,
        type: "group",
        name: `${event.title} Sohbeti`,
        isLocked: true,
        organizerId: event.organizer, // Using organizer name as ID for demo
        members: [event.organizer], // Initially only organizer has access
        messages: [],
        createdAt: new Date(),
    };

    eventChannels.set(channelId, channel);
    return channel;
}

/**
 * Get channel by ID
 */
export function getEventChannel(channelId: string): EventChannel | null {
    return eventChannels.get(channelId) || null;
}

/**
 * Get channel by event ID
 */
export function getChannelByEventId(eventId: string): EventChannel | null {
    return eventChannels.get(`channel-${eventId}`) || null;
}

/**
 * Add member to channel (called when participation is approved)
 * STRICT: Only adds to the specific channel
 */
export function addMemberToChannel(channelId: string, userId: string): boolean {
    const channel = eventChannels.get(channelId);
    if (!channel) return false;

    // Don't add duplicates
    if (!channel.members.includes(userId)) {
        channel.members.push(userId);
    }

    // Unlock channel once it has members
    if (channel.members.length > 1) {
        channel.isLocked = false;
    }

    return true;
}

/**
 * Check if user has access to a channel
 */
export function hasChannelAccess(channelId: string, userId: string): boolean {
    const channel = eventChannels.get(channelId);
    if (!channel) return false;
    return channel.members.includes(userId);
}

/**
 * Get all channels a user has access to
 */
export function getUserChannels(userId: string): EventChannel[] {
    return Array.from(eventChannels.values()).filter(
        channel => channel.members.includes(userId)
    );
}

/**
 * Add message to channel
 */
export function addMessageToChannel(
    channelId: string,
    senderId: string,
    senderName: string,
    content: string
): ChatMessage | null {
    const channel = eventChannels.get(channelId);
    if (!channel) return null;

    const message: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        channelId,
        senderId,
        senderName,
        content,
        timestamp: new Date(),
    };

    channel.messages.push(message);
    return message;
}

/**
 * Get channel messages
 */
export function getChannelMessages(channelId: string): ChatMessage[] {
    const channel = eventChannels.get(channelId);
    return channel?.messages || [];
}

/**
 * Get all event channels (for debugging)
 */
export function getAllEventChannels(): EventChannel[] {
    return Array.from(eventChannels.values());
}

// Initialize on module load
initializeChannels();
