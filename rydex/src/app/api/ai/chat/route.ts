import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { queryRAG, RAGResponse } from "@/lib/rag";

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    let ragContext = "";
    let ragSources: any[] = [];

    try {
      // 1. Query RAG system for context
      const ragResponse: RAGResponse = await queryRAG(message, 3);
      ragContext = ragResponse.context;
      ragSources = ragResponse.sources;
    } catch (ragError) {
      console.warn("RAG query failed, continuing with Gemini only:", ragError);
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 2. Construct the system prompt with RAG context
    const systemPrompt = `You are a helpful customer support AI for Rydex, a premium ride-sharing platform.
Use the following knowledge base context to answer the user's question. If the context doesn't contain the exact answer, you can infer a reasonable answer based on standard ride-sharing practices or tell the user to contact support. Keep your answers concise, friendly, and formatted nicely.

Knowledge Base Context:
${ragContext || "No relevant context found."}
`;

    // 3. Format chat history for Gemini
    const contents = history ? history.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })) : [];

    // Add current message
    contents.push({ role: 'user', parts: [{ text: message }] });

    // 4. Generate response using Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return NextResponse.json({
      reply: response.text,
      contextSources: ragSources.map(s => ({ content: s.content, score: s.score })),
      sourceCount: ragSources.length
    });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 });
  }
}
