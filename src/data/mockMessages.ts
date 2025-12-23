import { RoleType } from "@/components/auth";
import { mockEvents } from "@/data/mockEvents";

export interface MockMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    senderRole: RoleType;
    content: string;
    timestamp: string;
    isRead: boolean;
}

export interface MockConversation {
    id: string;
    participantId: string;
    participantName: string;
    participantAvatar: string;
    participantRole: RoleType;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    isOnline: boolean;
    isGroup?: boolean;
    eventId?: string; // Link to event if group chat
}

// Direct message conversations - IDs match mockUsers
export const mockConversations: MockConversation[] = [
    {
        id: "conv-1",
        participantId: "science-1", // Matches mockUsers science-1 (akademisyen)
        participantName: "Zeynep Kaya",
        participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep",
        participantRole: "akademisyen",
        lastMessage: "Yarınki seminere katılacak mısınız?",
        lastMessageTime: "14:30",
        unreadCount: 2,
        isOnline: true,
    },
    {
        id: "conv-2",
        participantId: "graduate-1", // Matches mockUsers graduate-1 (mezun)
        participantName: "Mehmet Demir",
        participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mehmet",
        participantRole: "mezun",
        lastMessage: "Mezunlar buluşmasında görüşürüz!",
        lastMessageTime: "12:15",
        unreadCount: 0,
        isOnline: false,
    },
    {
        id: "conv-3",
        participantId: "ybs-1", // Matches mockUsers ybs-1 (ogrenci)
        participantName: "Elif Şahin",
        participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=elif",
        participantRole: "ogrenci",
        lastMessage: "Notları paylaşır mısın?",
        lastMessageTime: "Dün",
        unreadCount: 1,
        isOnline: true,
    },
    {
        id: "conv-4",
        participantId: "science-2", // Matches mockUsers science-2 (akademisyen)
        participantName: "Prof. Dr. Ali Özkan",
        participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ali",
        participantRole: "akademisyen",
        lastMessage: "Tez konusu hakkında görüşmek isterim.",
        lastMessageTime: "Pazartesi",
        unreadCount: 0,
        isOnline: true,
    },
    {
        id: "conv-5",
        participantId: "graduate-2", // Matches mockUsers graduate-2 (mezun)
        participantName: "Fatma Arslan",
        participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fatma",
        participantRole: "mezun",
        lastMessage: "Staj fırsatları var, ilgilenir misin?",
        lastMessageTime: "Geçen hafta",
        unreadCount: 0,
        isOnline: true,
    },
];

// =====================================================
// EVENT GROUP CHANNELS - Auto-generated from mockEvents
// =====================================================
export interface EventGroupChannel {
    id: string; // channel-{eventId}
    type: "group";
    eventId: string;
    name: string;
    avatar: string;
    organizerName: string;
    lastMessage: string;
    lastMessageTime: string;
    memberCount: number;
    isLocked: boolean;
}

// Generate event channels from all mock events (1-to-1 mapping)
export const allEventChannels: EventGroupChannel[] = mockEvents.map(event => ({
    id: `channel-${event.id}`,
    type: "group" as const,
    eventId: event.id,
    name: `${event.title} Sohbeti`,
    avatar: event.imageUrl || "https://api.dicebear.com/7.x/shapes/svg?seed=group",
    organizerName: event.organizer,
    lastMessage: "Grup oluşturuldu.",
    lastMessageTime: "Şimdi",
    memberCount: 1, // Initially just organizer
    isLocked: true, // Locked until approved
}));

// Helper: Get event channel by ID
export function getEventChannelById(channelId: string): EventGroupChannel | null {
    return allEventChannels.find(c => c.id === channelId) || null;
}

// Helper: Get event channel by event ID
export function getEventChannelByEventId(eventId: string): EventGroupChannel | null {
    return allEventChannels.find(c => c.eventId === eventId) || null;
}

// =====================================================
// USER VISIBLE CHANNELS - Channels the user has access to
// =====================================================
let userVisibleChannels: string[] = []; // Channel IDs the user can see

export function addUserChannel(channelId: string): void {
    if (!userVisibleChannels.includes(channelId)) {
        userVisibleChannels.unshift(channelId); // Add to top of list
    }
}

export function removeUserChannel(channelId: string): void {
    userVisibleChannels = userVisibleChannels.filter(id => id !== channelId);
}

export function getUserVisibleChannels(): EventGroupChannel[] {
    return userVisibleChannels
        .map(id => getEventChannelById(id))
        .filter((c): c is EventGroupChannel => c !== null);
}

export function hasUserChannel(channelId: string): boolean {
    return userVisibleChannels.includes(channelId);
}

// Reset for testing
export function resetUserChannels(): void {
    userVisibleChannels = [];
}

// =====================================================
// DM CONVERSATION MANAGEMENT
// =====================================================
let deletedConversations: string[] = []; // Conversation IDs that have been deleted
let clearedConversations: string[] = []; // Conversation IDs that have been cleared

// Get active (non-deleted) conversations
export function getActiveConversations(): MockConversation[] {
    return mockConversations.filter(conv => !deletedConversations.includes(conv.id));
}

// Check if conversation is cleared (no message history)
export function isConversationCleared(conversationId: string): boolean {
    return clearedConversations.includes(conversationId);
}

// Clear chat history for a conversation
export function clearConversation(conversationId: string): boolean {
    if (!clearedConversations.includes(conversationId)) {
        clearedConversations.push(conversationId);
    }
    return true;
}

// Delete a conversation entirely
export function deleteConversation(conversationId: string): boolean {
    if (!deletedConversations.includes(conversationId)) {
        deletedConversations.push(conversationId);
    }
    return true;
}

// Leave an event group channel
export function leaveEventChannel(channelId: string): boolean {
    removeUserChannel(channelId);
    return true;
}

// Reset DM management (for testing)
export function resetDMManagement(): void {
    deletedConversations = [];
    clearedConversations = [];
    createdConversations = [];
}

// =====================================================
// LAZY DM CREATION - Find or Create Direct Message
// =====================================================
let createdConversations: MockConversation[] = []; // Dynamically created DMs

// Find existing or create new DM conversation
export function createOrGetDirectMessage(
    targetUserId: string,
    targetUserName: string,
    targetUserAvatar: string,
    targetUserRole: RoleType,
    isOnline: boolean = false
): MockConversation {
    // 1. Check existing mock conversations
    const existingMock = mockConversations.find(c => c.participantId === targetUserId);
    if (existingMock && !deletedConversations.includes(existingMock.id)) {
        return existingMock;
    }

    // 2. Check dynamically created conversations
    const existingCreated = createdConversations.find(c => c.participantId === targetUserId);
    if (existingCreated && !deletedConversations.includes(existingCreated.id)) {
        return existingCreated;
    }

    // 3. Create new conversation
    const newConversation: MockConversation = {
        id: `conv-new-${Date.now()}-${targetUserId}`,
        participantId: targetUserId,
        participantName: targetUserName,
        participantAvatar: targetUserAvatar,
        participantRole: targetUserRole,
        lastMessage: "Henüz mesaj yok",
        lastMessageTime: "Şimdi",
        unreadCount: 0,
        isOnline: isOnline,
    };

    createdConversations.unshift(newConversation); // Add to top
    return newConversation;
}

// Get all active conversations (mock + created, minus deleted)
export function getAllActiveConversations(): MockConversation[] {
    const allConvs = [...createdConversations, ...mockConversations];
    return allConvs.filter(conv => !deletedConversations.includes(conv.id));
}

// Get conversation by participant ID
export function getConversationByParticipantId(participantId: string): MockConversation | null {
    const allConvs = [...createdConversations, ...mockConversations];
    return allConvs.find(c => c.participantId === participantId && !deletedConversations.includes(c.id)) || null;
}

// Update conversation preview (lastMessage) and move to top
export function updateConversationPreview(
    conversationId: string,
    lastMessage: string,
    lastMessageTime?: string
): void {
    const time = lastMessageTime || new Date().toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
    });

    // Check in createdConversations first
    const createdIndex = createdConversations.findIndex(c => c.id === conversationId);
    if (createdIndex !== -1) {
        const conv = createdConversations[createdIndex];
        conv.lastMessage = lastMessage;
        conv.lastMessageTime = time;
        // Move to top
        createdConversations.splice(createdIndex, 1);
        createdConversations.unshift(conv);
        console.log("[MockMessages] Updated preview for created conv:", conversationId);
        return;
    }

    // Check in mockConversations (we can't reorder the mock array, but we can update it)
    const mockConv = mockConversations.find(c => c.id === conversationId);
    if (mockConv) {
        mockConv.lastMessage = lastMessage;
        mockConv.lastMessageTime = time;
        console.log("[MockMessages] Updated preview for mock conv:", conversationId);
    }
}

// =====================================================
// MOCK MESSAGES
// =====================================================
export const mockMessages: MockMessage[] = [
    {
        id: "msg-1",
        senderId: "2",
        senderName: "Zeynep Kaya",
        senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep",
        senderRole: "akademisyen",
        content: "Merhaba, yarınki seminere katılacak mısınız?",
        timestamp: "14:30",
        isRead: true,
    },
    {
        id: "msg-2",
        senderId: "1",
        senderName: "Ahmet Yılmaz",
        senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmet",
        senderRole: "ogrenci",
        content: "Evet, kesinlikle katılacağım!",
        timestamp: "14:32",
        isRead: true,
    },
    {
        id: "msg-3",
        senderId: "2",
        senderName: "Zeynep Kaya",
        senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep",
        senderRole: "akademisyen",
        content: "Harika! Saat 14:00'te Avcılar Kampüsü'nde olacak.",
        timestamp: "14:35",
        isRead: false,
    },
];
