/**
 * Istanbul University Faculties and Departments
 * Used for registration and profile
 */

export interface Faculty {
    id: string;
    name: string;
    departments: string[];
}

export const faculties: Faculty[] = [
    {
        id: "hukuk",
        name: "Hukuk Fakültesi",
        departments: ["Hukuk"],
    },
    {
        id: "tip",
        name: "İstanbul Tıp Fakültesi",
        departments: ["Tıp"],
    },
    {
        id: "fen",
        name: "Fen Fakültesi",
        departments: [
            "Matematik",
            "Fizik",
            "Kimya",
            "Biyoloji",
            "Astronomi ve Uzay Bilimleri",
        ],
    },
    {
        id: "edebiyat",
        name: "Edebiyat Fakültesi",
        departments: [
            "Türk Dili ve Edebiyatı",
            "Tarih",
            "Felsefe",
            "Sosyoloji",
            "Psikoloji",
            "Coğrafya",
        ],
    },
    {
        id: "iktisat",
        name: "İktisat Fakültesi",
        departments: [
            "İktisat",
            "İşletme",
            "Maliye",
            "Ekonometri",
            "Siyaset Bilimi",
        ],
    },
    {
        id: "muhendislik",
        name: "Mühendislik Fakültesi",
        departments: [
            "Bilgisayar Mühendisliği",
            "Elektrik-Elektronik Mühendisliği",
            "Makine Mühendisliği",
            "İnşaat Mühendisliği",
            "Endüstri Mühendisliği",
        ],
    },
    {
        id: "iletisim",
        name: "İletişim Fakültesi",
        departments: [
            "Gazetecilik",
            "Halkla İlişkiler",
            "Radyo, Televizyon ve Sinema",
        ],
    },
];

/**
 * Get departments for a specific faculty
 */
export function getDepartments(facultyId: string): string[] {
    const faculty = faculties.find((f) => f.id === facultyId);
    return faculty?.departments || [];
}
