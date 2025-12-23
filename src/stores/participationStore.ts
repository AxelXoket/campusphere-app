/**
 * Participation Store - Manages Event-User join requests with strict eventId scoping
 * Prevents the "global approval" bug by using unique event-user pairs
 */

export type ParticipationStatus = "pending" | "approved" | "rejected";

export interface Participation {
    id: string;
    eventId: string;
    userId: string;
    status: ParticipationStatus;
    joinedAt: Date;
    approvedAt?: Date;
    channelId?: string; // Linked chat channel ID
}

// In-memory store (replace with API/database in production)
let participations: Participation[] = [];

// Generate unique participation ID
function generateParticipationId(eventId: string, userId: string): string {
    return `p-${eventId}-${userId}`;
}

/**
 * Get participation status for a specific user-event pair
 * This is the KEY function that prevents global approval bugs
 */
export function getParticipation(eventId: string, userId: string): Participation | null {
    return participations.find(
        p => p.eventId === eventId && p.userId === userId
    ) || null;
}

/**
 * Request to join an event (creates pending participation)
 */
export function requestJoin(eventId: string, userId: string): Participation {
    // Check if already requested
    const existing = getParticipation(eventId, userId);
    if (existing) {
        return existing;
    }

    const participation: Participation = {
        id: generateParticipationId(eventId, userId),
        eventId,
        userId,
        status: "pending",
        joinedAt: new Date(),
    };

    participations.push(participation);
    return participation;
}

/**
 * Approve a user's join request (organizer action)
 * Automatically creates channel membership
 */
export function approveJoin(
    eventId: string,
    userId: string,
    channelId?: string
): Participation | null {
    const participation = getParticipation(eventId, userId);
    if (!participation) {
        return null;
    }

    // Update status
    participation.status = "approved";
    participation.approvedAt = new Date();

    // Link to chat channel (auto-created or existing)
    participation.channelId = channelId || `channel-${eventId}`;

    return participation;
}

/**
 * Reject a user's join request
 */
export function rejectJoin(eventId: string, userId: string): Participation | null {
    const participation = getParticipation(eventId, userId);
    if (!participation) {
        return null;
    }

    participation.status = "rejected";
    return participation;
}

/**
 * Get all participations for an event (for organizer dashboard)
 */
export function getEventParticipations(eventId: string): Participation[] {
    return participations.filter(p => p.eventId === eventId);
}

/**
 * Get all participations for a user (for user's joined events)
 */
export function getUserParticipations(userId: string): Participation[] {
    return participations.filter(p => p.userId === userId);
}

/**
 * Get approved participants for an event
 */
export function getApprovedParticipants(eventId: string): Participation[] {
    return participations.filter(
        p => p.eventId === eventId && p.status === "approved"
    );
}

/**
 * Check if user has access to event chat
 */
export function hasEventChatAccess(eventId: string, userId: string): boolean {
    const participation = getParticipation(eventId, userId);
    return participation?.status === "approved";
}

/**
 * Get chat channel ID for approved user
 */
export function getEventChatChannelId(eventId: string, userId: string): string | null {
    const participation = getParticipation(eventId, userId);
    if (participation?.status === "approved") {
        return participation.channelId || `channel-${eventId}`;
    }
    return null;
}

/**
 * Reset store (for testing/demo)
 */
export function resetParticipations(): void {
    participations = [];
}
