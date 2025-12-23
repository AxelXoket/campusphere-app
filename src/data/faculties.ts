/**
 * Istanbul University Faculty and Department Data (2025)
 * Source: Official IU Faculty List - Updated
 */

export const facultyDepartments: Record<string, string[]> = {
    "İktisat Fakültesi": [
        "İktisat",
        "İktisat (İngilizce)",
        "İşletme",
        "İşletme (İngilizce)",
        "Maliye",
        "Ekonometri",
        "Çalışma Ekonomisi ve Endüstri İlişkileri",
        "Siyaset Bilimi ve Uluslararası İlişkiler",
        "Siyaset Bilimi ve Uluslararası İlişkiler (İngilizce)",
        "Turizm İşletmeciliği",
        "Yönetim Bilişim Sistemleri (İngilizce)"
    ],
    "Hukuk Fakültesi": [
        "Hukuk"
    ],
    "İstanbul Tıp Fakültesi": [
        "Tıp"
    ],
    "Siyasal Bilgiler Fakültesi": [
        "Siyaset Bilimi ve Kamu Yönetimi",
        "Siyaset Bilimi ve Uluslararası İlişkiler (%100 İngilizce)",
        "İşletme"
    ],
    "Bilgisayar ve Bilişim Teknolojileri Fakültesi": [
        "Bilgisayar Mühendisliği",
        "Yazılım Mühendisliği",
        "Yapay Zeka Mühendisliği"
    ],
    "Edebiyat Fakültesi": [
        "Tarih",
        "Coğrafya",
        "Psikoloji",
        "Sosyoloji",
        "Felsefe",
        "Antropoloji",
        "Arkeoloji",
        "Sanat Tarihi",
        "Bilgi ve Belge Yönetimi",
        "Türk Dili ve Edebiyatı",
        "İngiliz Dili ve Edebiyatı",
        "Alman Dili ve Edebiyatı",
        "Fransız Dili ve Edebiyatı",
        "Amerikan Kültürü ve Edebiyatı",
        "İspanyol Dili ve Edebiyatı",
        "İtalyan Dili ve Edebiyatı",
        "Rus Dili ve Edebiyatı",
        "Arap Dili ve Edebiyatı",
        "Fars Dili ve Edebiyatı",
        "Çeviribilim (İngilizce/Almanca/Fransızca)",
        "Dilbilimi",
        "Hititoloji",
        "Müzikoloji",
        "Tiyatro Eleştirmenliği ve Dramaturji",
        "Doğu Dilleri ve Edebiyatları",
        "Slav Dilleri ve Edebiyatları",
        "Çağdaş Türk Lehçeleri ve Edebiyatları"
    ],
    "Fen Fakültesi": [
        "Matematik",
        "Fizik",
        "Kimya",
        "Biyoloji",
        "Astronomi ve Uzay Bilimleri"
    ],
    "İşletme Fakültesi": [
        "İşletme (Türkçe)",
        "İşletme (İngilizce)"
    ],
    "İletişim Fakültesi": [
        "Gazetecilik",
        "Halkla İlişkiler ve Tanıtım",
        "Radyo, Televizyon ve Sinema"
    ],
    "Mimarlık Fakültesi": [
        "Mimarlık",
        "Şehir ve Bölge Planlama",
        "İç Mimarlık"
    ],
    "İlahiyat Fakültesi": [
        "İlahiyat",
        "İlahiyat (İngilizce)",
        "İlahiyat (Arapça)"
    ],
    "Eczacılık Fakültesi": [
        "Eczacılık"
    ],
    "Diş Hekimliği Fakültesi": [
        "Diş Hekimliği"
    ],
    "Ulaştırma ve Lojistik Fakültesi": [
        "Lojistik Yönetimi"
    ],
    "Su Bilimleri Fakültesi": [
        "Su Bilimleri Mühendisliği"
    ],
    "AUZEF (Açık ve Uzaktan Eğitim)": [
        "Yönetim Bilişim Sistemleri",
        "İşletme",
        "İktisat",
        "Sosyoloji",
        "Tarih",
        "Coğrafya",
        "Çocuk Gelişimi",
        "Egzersiz ve Spor Bilimleri",
        "Felsefe",
        "Uluslararası Ticaret ve Lojistik",
        "İnsan Kaynakları Yönetimi",
        "Bilgisayar Programcılığı (Önlisans)"
    ]
};

// Get all faculty names
export const faculties = Object.keys(facultyDepartments);

// Get departments for a specific faculty
export function getDepartments(facultyName: string): string[] {
    return facultyDepartments[facultyName] || [];
}
