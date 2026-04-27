/**
 * RAG (Retrieval-Augmented Generation) Client
 * Communicates with the RAG backend to retrieve context from the vector database
 */

const RAG_BASE_URL = process.env.NEXT_PUBLIC_RAG_API_URL || "http://localhost:8000";

export interface RAGSource {
  content: string;
  metadata: Record<string, any>;
  score: number;
}

export interface RAGResponse {
  question: string;
  context: string;
  sources: RAGSource[];
  source_count: number;
}

/**
 * Query the RAG system for context based on a question
 * @param question - The user's question or query
 * @param topK - Number of top results to retrieve (default: 3)
 * @returns RAG context and source documents
 */
export async function queryRAG(
  question: string,
  topK: number = 3
): Promise<RAGResponse> {
  try {
    const response = await fetch(`${RAG_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        top_k: topK,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to query RAG system");
    }

    const data: RAGResponse = await response.json();
    return data;
  } catch (error) {
    console.error("RAG Query Error:", error);
    throw error;
  }
}

/**
 * Get context-enriched system prompt for Gemini
 * Includes RAG-retrieved context to improve answer quality
 * @param ragContext - Context retrieved from RAG
 * @param systemPrompt - Base system prompt
 * @returns Enhanced system prompt with RAG context
 */
export function enrichSystemPrompt(
  ragContext: string,
  systemPrompt: string
): string {
  if (!ragContext) {
    return systemPrompt;
  }

  return `${systemPrompt}

---
CONTEXT FROM KNOWLEDGE BASE:
${ragContext}
---

Use the above context to answer user questions accurately. If the context doesn't contain information to answer the question, you can infer based on standard practices or suggest contacting support.`;
}

/**
 * Check if RAG backend is healthy
 * @returns true if RAG backend is accessible
 */
export async function checkRAGHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${RAG_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error("RAG Health Check Error:", error);
    return false;
  }
}
