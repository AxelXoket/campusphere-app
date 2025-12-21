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

// 3 mock events across Istanbul (Gold markers)
export const mockEvents: MockEvent[] = [
    {
        id: "event-1",
        title: "Mezunlar Buluşması 2025",
        description: "İstanbul Üniversitesi mezunları için yıllık networking etkinliği.",
        date: "2025-01-15",
        time: "19:00",
        location: "Beyazıt Kampüsü, Rektörlük Binası",
        latitude: 41.0155,
        longitude: 28.9650,
        organizer: "İÜ Mezunlar Derneği",
        organizerRole: "mezun",
        attendeeCount: 150,
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
    },
    {
        id: "event-2",
        title: "Yapay Zeka Semineri",
        description: "Akademik çalışmalar ve endüstri uygulamaları üzerine panel.",
        date: "2025-01-20",
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
        date: "2025-02-05",
        time: "10:00",
        location: "İşletme Fakültesi",
        latitude: 41.0186,
        longitude: 28.9520,
        organizer: "Kariyer Merkezi",
        organizerRole: "akademisyen",
        attendeeCount: 300,
        imageUrl: "https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?w=400",
    },
];
