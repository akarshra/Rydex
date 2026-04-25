import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import knowledgeBase from "@/data/knowledge_base.json";

// Cosine similarity function
function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Phase 4.4: Enhanced AI Customer Support with Multi-Language
 * 
 * Improvements over v1:
 * - Intent classification (refund, ride_status, kyc, general)
 * - Multi-language support (Hindi, Tamil, Telugu, Kannada, Bengali)
 * - RAG with structured knowledge base
 * - Automatic escalation detection
 */

type SupportIntent = "refund" | "ride_status" | "kyc_help" | "pricing" | "safety" | "general";

interface ChatMessage {
  role: "user" | "assistant" | "model";
  content: string;
}

function classifyIntent(message: string): SupportIntent {
  const lower = message.toLowerCase();
  if (lower.match(/refund|money back|charge|billing|payment failed|double charge/)) return "refund";
  if (lower.match(/where is my driver|ride status|driver location|eta|when will|arrival/)) return "ride_status";
  if (lower.match(/kyc|verification|document|aadhaar|license|approve/)) return "kyc_help";
  if (lower.match(/price|fare|cost|expensive|cheap|estimate|surge/)) return "pricing";
  if (lower.match(/sos|emergency|safe|unsafe|police|help/)) return "safety";
  return "general";
}

function detectLanguage(message: string): string {
  // Simple heuristic-based language detection
  const hindiChars = /[\u0900-\u097F]/;
  const tamilChars = /[\u0B80-\u0BFF]/;
  const teluguChars = /[\u0C00-\u0C7F]/;
  const kannadaChars = /[\u0C80-\u0CFF]/;
  const bengaliChars = /[\u0980-\u09FF]/;

  if (hindiChars.test(message)) return "hindi";
  if (tamilChars.test(message)) return "tamil";
  if (teluguChars.test(message)) return "telugu";
  if (kannadaChars.test(message)) return "kannada";
  if (bengaliChars.test(message)) return "bengali";
  return "english";
}

function getLanguageInstruction(lang: string): string {
  const instructions: Record<string, string> = {
    hindi: "Respond in Hindi (Devanagari script). Keep answers concise and friendly.",
    tamil: "Respond in Tamil. Keep answers concise and friendly.",
    telugu: "Respond in Telugu. Keep answers concise and friendly.",
    kannada: "Respond in Kannada. Keep answers concise and friendly.",
    bengali: "Respond in Bengali. Keep answers concise and friendly.",
    english: "Respond in English. Keep answers concise and friendly.",
  };
  return instructions[lang] || instructions.english;
}

function shouldEscalateToHuman(intent: SupportIntent, message: string): boolean {
  const lower = message.toLowerCase();
  // Escalate if:
  // 1. Safety concern
  if (intent === "safety") return true;
  // 2. Refund with strong negative sentiment
  if (intent === "refund" && lower.match(/fraud|cheat|scam|lawyer|police|complaint/)) return true;
  // 3. KYC issues with urgency
  if (intent === "kyc_help" && lower.match(/urgent|blocked|cannot work|no income/)) return true;
  return false;
}

export async function POST(req: Request) {
  try {
    const { message, history, userContext } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 1. Classify intent
    const intent = classifyIntent(message);

    // 2. Detect language
    const lang = detectLanguage(message);

    // 3. Check escalation
    const escalate = shouldEscalateToHuman(intent, message);

    // 4. Embed the user's message for RAG
    const embedResponse = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: message,
    });
    const queryEmbedding = embedResponse.embeddings?.[0]?.values;

    let contextStr = "";
    if (queryEmbedding) {
      const scoredDocs = knowledgeBase.map((doc: any) => ({
        ...doc,
        score: cosineSimilarity(queryEmbedding, doc.embedding),
      }));
      scoredDocs.sort((a: any, b: any) => b.score - a.score);
      const topDocs = scoredDocs.slice(0, 3);
      contextStr = topDocs.map((doc: any) => `Q: ${doc.question}\nA: ${doc.answer}`).join("\n\n");
    }

    // 5. Intent-specific system prompts
    const intentInstructions: Record<SupportIntent, string> = {
      refund: "The user has a refund or billing question. Be empathetic, explain the refund policy clearly, and offer to connect them with a human agent if needed.",
      ride_status: "The user is asking about their ride status. Explain how to track rides, what statuses mean, and how to contact the driver.",
      kyc_help: "The user needs KYC or document verification help. Explain the required documents, verification timeline, and what to do if rejected.",
      pricing: "The user has a pricing question. Explain fare components, surge pricing, and how estimates work.",
      safety: "SAFETY PRIORITY: The user mentions safety. Be serious, provide emergency resources (SOS button, helpline), and strongly recommend speaking to a human agent immediately.",
      general: "General customer support query. Be helpful and friendly.",
    };

    const systemPrompt = `You are Rydex AI Support, an intelligent assistant for a premium ride-sharing platform.

${intentInstructions[intent]}

${getLanguageInstruction(lang)}

Use the following knowledge base context:
${contextStr}

User Context: ${userContext ? JSON.stringify(userContext) : "Guest user"}

Guidelines:
- Keep responses under 3 sentences unless detailed explanation is needed
- For safety issues, ALWAYS provide the emergency helpline: 1800-RYDEX-HELP
- If you don't know something, say so and offer to connect with human support
- Do not make up policies or procedures
`;

    // 6. Format chat history
    const contents = history
      ? history.map((msg: ChatMessage) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        }))
      : [];

    contents.push({ role: "user", parts: [{ text: message }] });

    // 7. Generate response
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: { systemInstruction: systemPrompt },
    });

    return NextResponse.json({
      reply: response.text,
      intent,
      language: lang,
      escalateToHuman: escalate,
      contextSources: contextStr ? "kb_matched" : "no_match",
      suggestions: intent === "refund" ? ["Check refund status", "Contact billing team"] :
                   intent === "ride_status" ? ["Track current ride", "View ride history"] :
                   intent === "kyc_help" ? ["Upload documents", "Check KYC status"] :
                   ["Book a ride", "View loyalty points", "Contact support"],
    });
  } catch (error: any) {
    console.error("AI Chat v2 Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 });
  }
}

