import { RoleType } from "@/components/auth";

export interface MockUser {
    id: string;
    name: string;
    role: RoleType;
    avatar: string;
    latitude: number;
    longitude: number;
    department?: string;
    isOnline: boolean;
}

// 10 mock users scattered across Istanbul
export const mockUsers: MockUser[] = [
    {
        id: "1",
        name: "Ahmet Yılmaz",
        role: "ogrenci",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmet",
        latitude: 41.0082,
        longitude: 28.9784, // Near Sultanahmet
        department: "Bilgisayar Mühendisliği",
        isOnline: true,
    },
    {
        id: "2",
        name: "Zeynep Kaya",
        role: "akademisyen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep",
        latitude: 41.0155,
        longitude: 28.9512, // Beyazıt Campus
        department: "Tıp Fakültesi",
        isOnline: true,
    },
    {
        id: "3",
        name: "Mehmet Demir",
        role: "mezun",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mehmet",
        latitude: 41.0422,
        longitude: 29.0092, // Kadıköy
        department: "İşletme",
        isOnline: false,
    },
    {
        id: "4",
        name: "Elif Şahin",
        role: "ogrenci",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=elif",
        latitude: 41.0369,
        longitude: 28.9850, // Beşiktaş
        department: "Hukuk Fakültesi",
        isOnline: true,
    },
    {
        id: "5",
        name: "Prof. Dr. Ali Özkan",
        role: "akademisyen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ali",
        latitude: 41.0186,
        longitude: 28.9647, // Laleli
        department: "Fizik",
        isOnline: true,
    },
    {
        id: "6",
        name: "Fatma Arslan",
        role: "mezun",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fatma",
        latitude: 41.0550,
        longitude: 29.0125, // Üsküdar
        department: "Mimarlık",
        isOnline: true,
    },
    {
        id: "7",
        name: "Can Yıldız",
        role: "ogrenci",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=can",
        latitude: 41.0289,
        longitude: 28.9762, // Eminönü
        department: "Makine Mühendisliği",
        isOnline: false,
    },
    {
        id: "8",
        name: "Ayşe Güneş",
        role: "ogrenci",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ayse",
        latitude: 41.0478,
        longitude: 28.9872, // Taksim
        department: "Psikoloji",
        isOnline: true,
    },
    {
        id: "9",
        name: "Doç. Dr. Burak Çelik",
        role: "akademisyen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=burak",
        latitude: 41.0112,
        longitude: 28.9553, // Vezneciler
        department: "Tarih",
        isOnline: false,
    },
    {
        id: "10",
        name: "Seda Koç",
        role: "mezun",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=seda",
        latitude: 41.0320,
        longitude: 29.0282, // Bostancı
        department: "Ekonomi",
        isOnline: true,
    },
];
