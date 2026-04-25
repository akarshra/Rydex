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

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 1. Embed the user's message
    const embedResponse = await ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: message,
    });
    const queryEmbedding = embedResponse.embeddings[0].values;

    // 2. Calculate similarity for each FAQ in the knowledge base
    const scoredDocs = knowledgeBase.map((doc: any) => ({
      ...doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    // 3. Sort by similarity (descending) and get top 3
    scoredDocs.sort((a, b) => b.score - a.score);
    const topDocs = scoredDocs.slice(0, 3);

    // 4. Construct the prompt for the LLM
    const contextStr = topDocs.map(doc => `Q: ${doc.question}\nA: ${doc.answer}`).join("\n\n");
    
    const systemPrompt = `You are a helpful customer support AI for Rydex, a premium ride-sharing platform.
Use the following knowledge base context to answer the user's question. If the context doesn't contain the exact answer, you can infer a reasonable answer based on standard ride-sharing practices or tell the user to contact support. Keep your answers concise, friendly, and formatted nicely.

Knowledge Base Context:
${contextStr}
`;

    // Format chat history for Gemini
    const contents = history ? history.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })) : [];

    // Add current message
    contents.push({ role: 'user', parts: [{ text: message }] });

    // 5. Generate response using Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return NextResponse.json({ 
      reply: response.text,
      contextSources: topDocs.filter(d => d.score > 0.6).map(d => d.question) // Just for debugging/UI
    });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 });
  }
}
