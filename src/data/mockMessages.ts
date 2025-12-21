import { RoleType } from "@/components/auth";

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
}

// Mock conversations for the chat list
export const mockConversations: MockConversation[] = [
    {
        id: "conv-1",
        participantId: "2",
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
        participantId: "3",
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
        participantId: "4",
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
        participantId: "5",
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
        participantId: "6",
        participantName: "Fatma Arslan",
        participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fatma",
        participantRole: "mezun",
        lastMessage: "Staj fırsatları var, ilgilenir misin?",
        lastMessageTime: "Geçen hafta",
        unreadCount: 0,
        isOnline: true,
    },
];

// Mock messages for a conversation
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
