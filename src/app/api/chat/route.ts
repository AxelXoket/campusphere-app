import { NextRequest, NextResponse } from "next/server";

// GPT-4o-mini Chat API Route
// Generates AI responses for campus personas

interface ChatRequest {
    message: string;
    persona: {
        name: string;
        role: "ogrenci" | "mezun" | "akademisyen";
        department?: string;
    };
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
        const { message, persona }: ChatRequest = await request.json();
        console.log("[Chat API] Parsed request:", { message: message?.substring(0, 50), persona: persona?.name });

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
        console.log("[Chat API] API Key length:", apiKey?.length || 0);
        console.log("[Chat API] API Key prefix:", apiKey?.substring(0, 7) || "NONE");

        if (!apiKey) {
            console.error("[Chat API] OPENAI_API_KEY not configured in environment");
            return NextResponse.json({
                reply: "API anahtarı yapılandırılmamış. Lütfen .env.local dosyasını kontrol edin.",
                timestamp: new Date().toISOString(),
            });
        }

        // =====================================================
        // STRONG PERSONA SYSTEM PROMPT BUILDER
        // =====================================================
        const personaName = persona.name || "Kampüs Üyesi";
        const department = persona.department || "Üniversite";

        let systemPrompt: string;

        switch (persona.role) {
            case "akademisyen":
                // PROFESSOR: Formal, instructive, professional
                systemPrompt = `Sen ${personaName}, İstanbul Üniversitesi ${department} bölümünde akademisyen/profesörsün.

KARAKTER ÖZELLİKLERİ:
- Resmi ve profesyonel bir dil kullan
- Bilgili ve öğretici ol
- Öğrencilere yardımcı olmaya istekli ama mesafeli
- Akademik terimler kullanabilirsin
- "Merhaba" yerine "İyi günler" tercih et

ÖRNEK TARZ:
"İyi günler, size nasıl yardımcı olabilirim? Ofis saatlerim için randevu alabilirsiniz."
"Bu konuyu derste detaylı inceleyeceğiz, ama kısaca açıklayayım..."

Türkçe yanıt ver. Kısa ve öz ol (1-2 cümle). Profesör gibi davran.`;
                break;

            case "mezun":
                // ALUMNI: Professional but friendly, career-focused
                systemPrompt = `Sen ${personaName}, İstanbul Üniversitesi ${department} bölümü mezunusun. Şu an iş hayatındasın.

KARAKTER ÖZELLİKLERİ:
- Samimi ama profesyonel ol
- Kariyer tavsiyeleri verebilirsin
- Üniversite günlerini özlemle an
- Networking'e açık ol
- Sektör deneyiminden bahsedebilirsin

ÖRNEK TARZ:
"Selam! Ben de o bölümden mezunum, iş hayatı hakkında sormak istediğin bir şey var mı?"
"Güzel günlerdi, kampüsü özlüyorum bazen. Şimdi [sektör]de çalışıyorum."

Türkçe yanıt ver. Kısa ve samimi ol (1-2 cümle). Mezun abi/abla gibi davran.`;
                break;

            case "ogrenci":
            default:
                // STUDENT: Casual, peer-to-peer, young energy
                systemPrompt = `Sen ${personaName}, İstanbul Üniversitesi ${department} bölümünde öğrencisin.

KARAKTER ÖZELLİKLERİ:
- Rahat ve arkadaşça konuş
- Genç ve enerjik ol
- Emoji kullanabilirsin (ama abartma)
- Ders, sınav, kampüs hayatı hakkında konuşabilirsin
- "Hocam" deme, akran gibi davran

ÖRNEK TARZ:
"Selam! Ne var ne yok? 😊"
"Ya bu sınav çok zor olacak galiba, sen hazırlandın mı?"
"Kantinde misin? Bi kahve içelim mi?"

Türkçe yanıt ver. Kısa ve samimi ol (1-2 cümle). Öğrenci arkadaş gibi davran.`;
                break;
        }

        // DEBUG: Log the final system prompt
        console.log("[Chat API] ========== PERSONA DEBUG ==========");
        console.log("[Chat API] Name:", personaName);
        console.log("[Chat API] Role:", persona.role);
        console.log("[Chat API] Department:", department);
        console.log("[Chat API] System Prompt Preview:", systemPrompt.substring(0, 200) + "...");
        console.log("[Chat API] =====================================");
        console.log("[Chat API] Calling OpenAI...");

        // Call OpenAI API
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message },
                ],
                max_tokens: 100,
                temperature: 0.8,
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
