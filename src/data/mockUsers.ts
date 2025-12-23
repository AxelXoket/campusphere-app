import { RoleType } from "@/components/auth";

export interface MockUser {
    id: string;
    name: string;
    role: RoleType;
    avatar: string;
    latitude: number;
    longitude: number;
    faculty: string;
    department: string;
    isOnline: boolean;
    // Global user properties
    hasJobPosting?: boolean;
    hasInternship?: boolean;
    hasEvent?: boolean;
}

// Current user context for visibility filtering
export interface CurrentUserContext {
    role: RoleType;
    faculty: string;
    department: string;
}

// Beyazıt Campus center coordinates
const BEYAZIT_CENTER = { lat: 41.011, lng: 28.965 };

// =====================================================
// SEEDED RANDOM - Deterministic positioning for stability
// =====================================================
function seededRandom(seed: number): number {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
}

function seededPosition(
    seed: number,
    centerLat: number,
    centerLng: number,
    radiusKm: number = 0.5
): { lat: number; lng: number } {
    const radiusInDegrees = radiusKm / 111;
    const angle = seededRandom(seed) * 2 * Math.PI;
    const distance = seededRandom(seed + 1) * radiusInDegrees;
    return {
        lat: centerLat + distance * Math.cos(angle),
        lng: centerLng + distance * Math.sin(angle),
    };
}

// Turkish names - static arrays
const firstNames = [
    "Ahmet", "Mehmet", "Mustafa", "Ali", "Hüseyin", "İbrahim", "Emre", "Burak", "Cem", "Deniz",
    "Zeynep", "Elif", "Ayşe", "Fatma", "Seda", "Merve", "Esra", "Büşra", "Gizem", "Ceren",
    "Oğuz", "Kaan", "Arda", "Yusuf", "Mert", "Berk", "Efe", "Umut", "Onur", "Serkan",
    "Dilara", "Melisa", "Selin", "Cansu", "Ebru", "Derya", "Şeyma", "İrem", "Tuğçe", "Pelin"
];

const lastNames = [
    "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Öztürk", "Aydın", "Arslan", "Koç",
    "Erdoğan", "Korkmaz", "Özdemir", "Kılıç", "Güneş", "Aksoy", "Polat", "Özkan", "Kurt", "Çetin"
];

const academicPrefixes = ["Prof. Dr.", "Doç. Dr.", "Dr. Öğr. Üyesi", "Araş. Gör. Dr."];

function seededName(seed: number): string {
    const firstIdx = Math.floor(seededRandom(seed) * firstNames.length);
    const lastIdx = Math.floor(seededRandom(seed + 100) * lastNames.length);
    return `${firstNames[firstIdx]} ${lastNames[lastIdx]}`;
}

function seededAcademicPrefix(seed: number): string {
    return academicPrefixes[Math.floor(seededRandom(seed) * academicPrefixes.length)];
}

// =====================================================
// GROUP A: YBS Students (40 users) - User's Department
// =====================================================
const groupA: MockUser[] = Array.from({ length: 40 }, (_, i) => {
    const seed = 1000 + i;
    const pos = seededPosition(seed, BEYAZIT_CENTER.lat, BEYAZIT_CENTER.lng, 0.3);
    return {
        id: `ybs-${i + 1}`,
        name: seededName(seed),
        role: "ogrenci" as RoleType,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=ybs${i}`,
        latitude: pos.lat,
        longitude: pos.lng,
        faculty: "İktisat Fakültesi",
        department: "Yönetim Bilişim Sistemleri (İngilizce)",
        isOnline: seededRandom(seed + 50) > 0.3,
    };
});

// =====================================================
// GROUP B: Faculty Peers - İktisat, Maliye, Ekonometri (30 users)
// =====================================================
const facultyDepts = ["İktisat", "İktisat (İngilizce)", "İşletme", "Maliye", "Ekonometri", "Turizm İşletmeciliği"];
const groupB: MockUser[] = Array.from({ length: 30 }, (_, i) => {
    const seed = 2000 + i;
    const pos = seededPosition(seed, BEYAZIT_CENTER.lat, BEYAZIT_CENTER.lng, 0.4);
    return {
        id: `faculty-peer-${i + 1}`,
        name: seededName(seed),
        role: "ogrenci" as RoleType,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=peer${i}`,
        latitude: pos.lat,
        longitude: pos.lng,
        faculty: "İktisat Fakültesi",
        department: facultyDepts[Math.floor(seededRandom(seed) * facultyDepts.length)],
        isOnline: seededRandom(seed + 50) > 0.4,
    };
});

// =====================================================
// GROUP C: Global Mentors - Alumni & Academics (20 users)
// =====================================================
const globalFaculties = [
    { faculty: "Hukuk Fakültesi", dept: "Hukuk" },
    { faculty: "İstanbul Tıp Fakültesi", dept: "Tıp" },
    { faculty: "Fen Fakültesi", dept: "Fizik" },
    { faculty: "Fen Fakültesi", dept: "Matematik" },
    { faculty: "Edebiyat Fakültesi", dept: "Tarih" },
    { faculty: "Edebiyat Fakültesi", dept: "Psikoloji" },
    { faculty: "Mimarlık Fakültesi", dept: "Mimarlık" },
    { faculty: "İletişim Fakültesi", dept: "Gazetecilik" },
    { faculty: "Bilgisayar ve Bilişim Teknolojileri Fakültesi", dept: "Bilgisayar Mühendisliği" },
    { faculty: "Bilgisayar ve Bilişim Teknolojileri Fakültesi", dept: "Yapay Zeka Mühendisliği" },
];

const groupC: MockUser[] = Array.from({ length: 20 }, (_, i) => {
    const seed = 3000 + i;
    const pos = seededPosition(seed, BEYAZIT_CENTER.lat, BEYAZIT_CENTER.lng, 0.8);
    const facDept = globalFaculties[i % globalFaculties.length];
    const isAcademic = i < 10;
    return {
        id: `global-${i + 1}`,
        name: isAcademic ? `${seededAcademicPrefix(seed)} ${seededName(seed)}` : seededName(seed),
        role: isAcademic ? "akademisyen" as RoleType : "mezun" as RoleType,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=global${i}`,
        latitude: pos.lat,
        longitude: pos.lng,
        faculty: facDept.faculty,
        department: facDept.dept,
        isOnline: seededRandom(seed + 50) > 0.2,
        hasJobPosting: seededRandom(seed + 60) > 0.5,
        hasInternship: seededRandom(seed + 70) > 0.5,
        hasEvent: seededRandom(seed + 80) > 0.4,
    };
});

// =====================================================
// GROUP D: Invisible Control - Hukuk Students (10 users)
// =====================================================
const groupD: MockUser[] = Array.from({ length: 10 }, (_, i) => {
    const seed = 4000 + i;
    const pos = seededPosition(seed, BEYAZIT_CENTER.lat + 0.01, BEYAZIT_CENTER.lng + 0.01, 0.3);
    return {
        id: `law-${i + 1}`,
        name: seededName(seed),
        role: "ogrenci" as RoleType,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=law${i}`,
        latitude: pos.lat,
        longitude: pos.lng,
        faculty: "Hukuk Fakültesi",
        department: "Hukuk",
        isOnline: seededRandom(seed + 50) > 0.5,
    };
});

// Combined mock users (100 total) - STABLE, no re-generation
export const mockUsers: MockUser[] = [...groupA, ...groupB, ...groupC, ...groupD];

// =====================================================
// VISIBILITY ALGORITHM: getVisibleUsers
// =====================================================
/**
 * Sphere of Influence Visibility Algorithm
 * 
 * Layer 1: Global Network (Akademisyen/Mezun) - ALWAYS SHOW
 * Layer 2: Department Cluster (Same Dept Students) - SHOW ALL
 * Layer 3: Faculty Sprinkle (Same Faculty, Diff Dept) - SHOW 15-20%
 * Layer 4: Privacy Shield (Different Faculty Students) - HIDE
 */
export function getVisibleUsers(
    allUsers: MockUser[],
    currentUser: CurrentUserContext,
    sprinklePercentage: number = 0.18
): MockUser[] {
    const sprinkleSeed = currentUser.department.length + currentUser.faculty.length;

    return allUsers.filter((user) => {
        // Layer 1: Global Network - Akademisyen & Mezun ALWAYS visible
        if (user.role === "akademisyen" || user.role === "mezun") {
            return true;
        }

        // Only students from here on
        if (user.role !== "ogrenci") {
            return false;
        }

        // Layer 2: Department Cluster - Same department = 100% visible
        if (user.faculty === currentUser.faculty && user.department === currentUser.department) {
            return true;
        }

        // Layer 3: Faculty Sprinkle - Same faculty, different department = sparse visibility
        if (user.faculty === currentUser.faculty && user.department !== currentUser.department) {
            const hash = user.id.split("").reduce((a, b) => a + b.charCodeAt(0), sprinkleSeed);
            return (hash % 100) < (sprinklePercentage * 100);
        }

        // Layer 4: Privacy Shield - Different faculty = HIDE
        return false;
    });
}

// =====================================================
// Helper: Get user's opportunities
// =====================================================
export function getUserOpportunities(user: MockUser): {
    hasJobPosting: boolean;
    hasInternship: boolean;
    hasEvent: boolean;
} {
    return {
        hasJobPosting: user.hasJobPosting || false,
        hasInternship: user.hasInternship || false,
        hasEvent: user.hasEvent || false,
    };
}

// =====================================================
// Statistics for debugging
// =====================================================
export function getVisibilityStats(
    allUsers: MockUser[],
    currentUser: CurrentUserContext
): {
    total: number;
    visible: number;
    global: number;
    department: number;
    facultySprinkle: number;
    hidden: number;
} {
    const visible = getVisibleUsers(allUsers, currentUser);

    const global = visible.filter(u => u.role === "akademisyen" || u.role === "mezun").length;
    const department = visible.filter(u =>
        u.role === "ogrenci" &&
        u.faculty === currentUser.faculty &&
        u.department === currentUser.department
    ).length;
    const facultySprinkle = visible.filter(u =>
        u.role === "ogrenci" &&
        u.faculty === currentUser.faculty &&
        u.department !== currentUser.department
    ).length;

    return {
        total: allUsers.length,
        visible: visible.length,
        global,
        department,
        facultySprinkle,
        hidden: allUsers.length - visible.length,
    };
}
