export interface MockEvent {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    latitude: number;
    longitude: number;
    organizer: string;
    organizerRole: "mezun" | "akademisyen";
    attendeeCount: number;
    imageUrl?: string;
}

/**
 * Generate dynamic dates relative to today for calendar integration
 */
function getRelativeDate(daysFromNow: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split("T")[0];
}

// Mock events with dynamic dates for calendar view
export const mockEvents: MockEvent[] = [
    {
        id: "event-1",
        title: "Mezunlar Buluşması",
        description: "İstanbul Üniversitesi mezunları için yıllık networking etkinliği.",
        date: getRelativeDate(0), // Today
        time: "19:00",
        location: "Beyazıt Kampüsü, Rektörlük Binası",
        latitude: 41.0155,
        longitude: 28.965,
        organizer: "İÜ Mezunlar Derneği",
        organizerRole: "mezun",
        attendeeCount: 150,
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
    },
    {
        id: "event-2",
        title: "Yapay Zeka Semineri",
        description: "Akademik çalışmalar ve endüstri uygulamaları üzerine panel.",
        date: getRelativeDate(2), // 2 days from now
        time: "14:00",
        location: "Avcılar Kampüsü, Konferans Salonu",
        latitude: 40.9892,
        longitude: 28.7208,
        organizer: "Prof. Dr. Ali Özkan",
        organizerRole: "akademisyen",
        attendeeCount: 80,
        imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400",
    },
    {
        id: "event-3",
        title: "Kariyer Günleri",
        description: "Öğrenciler ve mezunlar için iş fırsatları ve staj olanakları.",
        date: getRelativeDate(4), // 4 days from now
        time: "10:00",
        location: "İşletme Fakültesi",
        latitude: 41.0186,
        longitude: 28.952,
        organizer: "Kariyer Merkezi",
        organizerRole: "akademisyen",
        attendeeCount: 300,
        imageUrl: "https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?w=400",
    },
];
