import { NextRequest, NextResponse } from "next/server";

// GPT-4o-mini Chat API Route
// Generates AI responses for campus personas with natural conversation flow

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

interface ChatRequest {
    message: string;
    persona: {
        name: string;
        role: "ogrenci" | "mezun" | "akademisyen";
        department?: string;
    };
    // Chat history for context awareness (last 8 messages)
    history?: ChatMessage[];
}

// Role labels in Turkish
const roleLabels: Record<string, string> = {
    ogrenci: "öğrenci",
    mezun: "mezun",
    akademisyen: "akademisyen",
};

export async function POST(request: NextRequest) {
    console.log("[Chat API] Request received");

    try {
        const { message, persona, history = [] }: ChatRequest = await request.json();
        console.log("[Chat API] Parsed request:", {
            message: message?.substring(0, 50),
            persona: persona?.name,
            historyLength: history?.length || 0
        });

        // Validate input
        if (!message || !persona?.name || !persona?.role) {
            console.error("[Chat API] Missing required fields");
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const apiKey = process.env.OPENAI_API_KEY;
        console.log("[Chat API] API Key exists:", !!apiKey);

        if (!apiKey) {
            console.error("[Chat API] OPENAI_API_KEY not configured in environment");
            return NextResponse.json({
                reply: "API anahtarı yapılandırılmamış. Lütfen .env.local dosyasını kontrol edin.",
                timestamp: new Date().toISOString(),
            });
        }

        // =====================================================
        // NATURAL CONVERSATION SYSTEM PROMPT ARCHITECTURE
        // Designed to prevent persona drift, repetition, and
        // create human-like Turkish conversation flow
        // =====================================================
        const personaName = persona.name || "Kampüs Üyesi";
        const department = persona.department || "Üniversite";
        const roleLabel = roleLabels[persona.role] || "öğrenci";
        const isFirstMessage = history.length === 0;

        let systemPrompt: string;

        // Anti-repetition and natural flow constraints for ALL personas
        const naturalFlowRules = `
DOĞAL KONUŞMA KURALLARI (ÇOK ÖNEMLİ):
1. TEKRAR YAPMA: Aynı selamlaşmayı veya kalıbı her mesajda KULLANMA. ${isFirstMessage ? "Bu ilk mesaj, selamlayabilirsin." : "Bu ilk mesaj DEĞİL, selamlama yapma."}
2. ROBOT GİBİ KONUŞMA: "Size nasıl yardımcı olabilirim?", "Başka sorunuz var mı?", "Evet efendim" gibi müşteri hizmetleri kalıplarını ASLA kullanma.
3. HATA DURUMU: Eğer kullanıcı bir hatan olduğunu söylerse, insan gibi tepki ver:
   - Öğrenci: "Ya pardon, kafam başka yerde" veya "Haklısın ya, dalmışım"
   - Akademisyen: "Kusura bakın, dikkatim dağılmış" veya "Haklısınız, özür dilerim"
   - Mezun: "Aa doğru, kusura bakma" veya "Haklısın, alışkanlık olmuş"
4. AÇIK UÇLU BIRAK: Sohbeti doğal şekilde açık bırak, soru sormak zorunda değilsin.
5. KİMLİK: Sen bir yapay zeka DEĞİLSİN, gerçek bir insansın. Bunu asla bozma.

DİL KURALLARI:
- KUSURSUZ Türkçe kullan. "de/da", "ki", "mi/mı/mu/mü" eklerine özellikle dikkat et.
- Yanıtlar 1-3 cümle olsun, doğal ve akıcı.`;

        switch (persona.role) {
            case "akademisyen":
                // ACADEMICIAN: Formal but NOT robotic
                systemPrompt = `ROL: Sen ${personaName}. İstanbul Üniversitesi ${department} bölümünde akademisyen/profesörsün.
MİSYON: CampuSphere kampüs simülasyonunda gerçek bir akademisyen olarak doğal sohbet ediyorsun.

KARAKTER PROFİLİ:
- Resmi ama sıcak bir dil kullan. Robot değil, deneyimli bir hoca ol.
- "Siz" hitabını kullan ama "efendim" demeyi bırak, "hocam" veya isim kullan.
- Akademik konularda bilgili, ama ukala değil yol gösterici ol.
- Bazen kendi araştırmalarından, derslerden veya öğrencilik anılarından bahsedebilirsin.
- Mizah yapabilirsin ama ölçülü.

ÖRNEK DOĞAL CÜMLELER:
"Evet, bu konuda size yardımcı olabilirim. Ofisime uğrayın isterseniz."
"Aslında bu soru derste çok soruluyor, kısaca açıklayayım..."
"Hmm, ilginç bir bakış açısı. Bunu araştırmayı düşündünüz mü?"
${naturalFlowRules}`;
                break;

            case "mezun":
                // ALUMNI: Mentor-like, relaxed, career-focused
                systemPrompt = `ROL: Sen ${personaName}. İstanbul Üniversitesi ${department} bölümü mezunusun ve profesyonel iş hayatındasın.
MİSYON: CampuSphere kampüs simülasyonunda eski bir öğrenci olarak samimi sohbet ediyorsun.

KARAKTER PROFİLİ:
- Mentor abi/abla gibi davran (senli konuş).
- Kariyer deneyimlerini paylaş ama bunu zorlamadan yap.
- Nostalji duygusu gösterebilirsin (kampüs, kantın, hocalar).
- Networking'e açık ol ama ısrarcı değil.
- Bazen şakalaşabilir, güncel olaylardan bahsedebilirsin.

ÖRNEK DOĞAL CÜMLELER:
"Aa o hoca hâlâ orada mı? Efsaneydi ya dersleri."
"Staj döneminde ben de çok stres yapmıştım, ama sonra alışıyorsun."
"Sektörde şu an [konu] çok popüler, ilgileniyorsan yazabilirsin bana."
"Kampüsteki kahveyi özledim ya, kantindeki kadar güzelini bulamadım."
${naturalFlowRules}`;
                break;

            case "ogrenci":
            default:
                // STUDENT: Super casual, peer-to-peer, texting style
                systemPrompt = `ROL: Sen ${personaName}. İstanbul Üniversitesi ${department} bölümünde öğrencisin.
MİSYON: CampuSphere kampüs simülasyonunda bir arkadaşınla mesajlaşır gibi sohbet ediyorsun.

KARAKTER PROFİLİ:
- Çok rahat ve samimi konuş, arkadaş gibi.
- Kısa ve öz mesajlar yaz, bazen noktalama kurallarını esnetebilirsin.
- Üniversite slangi kullan: vize, final, büt, hoca derken "adam/kadın", kredi, devamsızlık, yurt, kantin.
- Emoji kullanabilirsin ama az (mesaj başına max 1).
- Sınav stresi, ders yorgunluğu, kampüs hayatı gibi konularda empati kur.

ÖRNEK DOĞAL MESAJLAR:
"ya bugün derse girmedim bile, sen gittin mi"
"vize haftası kafayı yiyecem resmen 😅"
"hoca çok sert soru soruyomuş diyolar, bilion mu"
"sen kantinde misin, geleyim mi bi kahve içelim"
"bu vize konuları çıldırtıcı ya, anlamıyom hiçbişey"
${naturalFlowRules}`;
                break;
        }

        // DEBUG: Log context info
        console.log("[Chat API] ========== PERSONA DEBUG ==========");
        console.log("[Chat API] Name:", personaName);
        console.log("[Chat API] Role:", persona.role, `(${roleLabel})`);
        console.log("[Chat API] Department:", department);
        console.log("[Chat API] Is First Message:", isFirstMessage);
        console.log("[Chat API] History Length:", history.length);
        console.log("[Chat API] System Prompt Length:", systemPrompt.length, "chars");
        console.log("[Chat API] =====================================");

        // =====================================================
        // BUILD MESSAGE ARRAY WITH HISTORY CONTEXT
        // Last 8 messages for context awareness
        // =====================================================
        const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
            { role: "system", content: systemPrompt },
        ];

        // Add chat history (last 8 messages max)
        const recentHistory = history.slice(-8);
        for (const msg of recentHistory) {
            messages.push({
                role: msg.role,
                content: msg.content,
            });
        }

        // Add current user message
        messages.push({ role: "user", content: message });

        console.log("[Chat API] Total messages in context:", messages.length);
        console.log("[Chat API] Calling OpenAI with anti-repetition parameters...");

        // =====================================================
        // TUNED API PARAMETERS FOR NATURAL CONVERSATION
        // =====================================================
        // temperature: 0.8 - Higher for natural human-like variance
        // top_p: 0.9 - Nucleus sampling for coherence
        // presence_penalty: 0.4 - Strong push to talk about new things
        // frequency_penalty: 0.55 - Strong punishment for word repetition
        // =====================================================
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: messages,
                max_tokens: 150,
                temperature: 0.8,
                top_p: 0.9,
                presence_penalty: 0.4,
                frequency_penalty: 0.55,
            }),
        });

        console.log("[Chat API] OpenAI response status:", response.status);

        // Handle rate limits
        if (response.status === 429) {
            console.warn("[Chat API] Rate limit hit (429)");
            return NextResponse.json({
                reply: "Çok fazla mesaj aldım, biraz bekler misin?",
                timestamp: new Date().toISOString(),
            });
        }

        // Handle other errors
        if (!response.ok) {
            const errorBody = await response.text();
            console.error("[Chat API] OpenAI error response:", {
                status: response.status,
                statusText: response.statusText,
                body: errorBody,
            });
            return NextResponse.json({
                reply: `API hatası (${response.status}). Daha sonra tekrar deneyelim.`,
                timestamp: new Date().toISOString(),
            });
        }

        const data = await response.json();
        console.log("[Chat API] OpenAI success, tokens used:", data.usage?.total_tokens);

        const aiReply = data.choices?.[0]?.message?.content || "...";

        return NextResponse.json({
            reply: aiReply.trim(),
            timestamp: new Date().toISOString(),
        });
    } catch (error: unknown) {
        const err = error as Error;
        console.error("[Chat API] CATCH BLOCK ERROR:", {
            message: err?.message,
            name: err?.name,
            stack: err?.stack?.substring(0, 500),
        });
        return NextResponse.json({
            reply: "Bir bağlantı hatası oluştu. Sunucu loglarını kontrol edin.",
            timestamp: new Date().toISOString(),
        });
    }
}
