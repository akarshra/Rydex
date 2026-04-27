# RAG Integration with Rydex

This document describes how the RAG (Retrieval-Augmented Generation) system is integrated with the Rydex platform.

## Overview

The RAG system enhances Rydex's AI capabilities by:
1. **Support Chat**: Using vector DB retrieval to provide context-aware answers to customer questions
2. **Booking Intent Extraction**: Improving AI booking intent detection with domain knowledge
3. **Multi-Intent Support**: Handling refunds, ride status, KYC, pricing, and safety questions with proper context

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Rydex Frontend                          │
│  (Chat Widget, Booking AI, Support Chat)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌─────────────────────┐      ┌──────────────────────┐
│  Rydex API Routes   │      │  RAG Backend API     │
│  /api/ai/chat       │◄────►│  (FastAPI)           │
│  /api/ai/chat-v2    │      │  POST /chat          │
│  /api/ai/extract-   │      │  POST /upload        │
│    booking          │      │  POST /query         │
└─────────────────────┘      │  GET /health         │
                              └──────┬───────────────┘
                                     │
                              ┌──────▼───────────┐
                              │  ChromaDB Vector │
                              │  Database        │
                              │  (Knowledge Base)│
                              └──────────────────┘
                                     │
                              ┌──────▼──────────────────────┐
                              │ Knowledge Sources:          │
                              │ - Rydex FAQs               │
                              │ - Booking Docs             │
                              │ - Ride Policies            │
                              │ - Partner/Vendor Info      │
                              └─────────────────────────────┘
```

## Setup Instructions

### 1. RAG Backend Setup

The RAG backend is a FastAPI service that should be running via Docker Compose:

```bash
cd rag-demo/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Or via Docker:
```bash
docker-compose up rag-backend
```

### 2. Environment Configuration

In `rydex/.env.local`, add:

```env
NEXT_PUBLIC_RAG_API_URL=http://localhost:8000
```

For production, set this to your deployed RAG service URL.

### 3. Rydex Integration

The integration is already configured in:
- `/api/ai/chat` - Uses RAG for support conversations
- `/api/ai/chat-v2` - Enhanced chat with intent classification and RAG
- `/api/ai/extract-booking` - Uses RAG context to improve booking intent extraction
- `/lib/rag.ts` - RAG client library for querying the backend

## How It Works

### Support Chat Flow

1. User sends a message via the chat widget
2. Message is sent to `/api/ai/chat`
3. Route queries RAG backend with the message
4. RAG returns relevant documents from the vector DB
5. Gemini generates a response using the RAG context
6. Response is sent back to user with source references

### Booking Intent Extraction Flow

1. User enters natural language booking request in hero section
2. Request is sent to `/api/ai/extract-booking`
3. RAG queries vector DB for booking-related context
4. Gemini extracts booking details (pickup, dropoff, vehicle type) using context
5. Extracted details are used to pre-fill the booking form

### Enhanced Chat (v2) Flow

1. User sends message to chat widget
2. Intent is classified (refund, ride_status, kyc, pricing, safety, general)
3. Language is detected (English, Hindi, Tamil, Telugu, Kannada, Bengali)
4. RAG queries vector DB for relevant knowledge
5. Gemini generates response in detected language with proper context
6. Response may include escalation suggestion for sensitive issues

## RAG Endpoints

### POST /chat
Retrieve context from the vector database.

**Request:**
```json
{
  "question": "Can I cancel my ride?",
  "top_k": 3
}
```

**Response:**
```json
{
  "question": "Can I cancel my ride?",
  "context": "Cancellations can be made from...",
  "sources": [
    {
      "content": "...",
      "metadata": {...},
      "score": 0.87
    }
  ],
  "source_count": 3
}
```

### POST /upload
Upload documents (PDF/TXT) to the vector database.

**Request:**
```
Content-Type: multipart/form-data
file: [PDF or TXT file]
```

**Response:**
```json
{
  "message": "Successfully processed 42 chunks from document.pdf"
}
```

### POST /query
Raw similarity search in the vector database.

**Request:**
```json
{
  "query": "cancellation policy",
  "top_k": 5
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "vector_db": "Chroma"
}
```

## RAG Client Library (`src/lib/rag.ts`)

### Functions

#### `queryRAG(question: string, topK?: number): Promise<RAGResponse>`
Query the RAG system for context.

```typescript
import { queryRAG } from '@/lib/rag';

const response = await queryRAG("How do I schedule a ride?", 3);
console.log(response.context); // Relevant documents
console.log(response.sources); // Document metadata and scores
```

#### `enrichSystemPrompt(ragContext: string, systemPrompt: string): string`
Enhance a system prompt with RAG context.

```typescript
const enrichedPrompt = enrichSystemPrompt(
  ragContext,
  "You are a Rydex support agent"
);
```

#### `checkRAGHealth(): Promise<boolean>`
Check if RAG backend is available.

```typescript
const isHealthy = await checkRAGHealth();
if (!isHealthy) {
  console.warn("RAG backend unavailable");
}
```

## Integration Points

### 1. Chat Widget (`src/app/api/ai/chat/route.ts`)

- Queries RAG for context on user messages
- Falls back to Gemini-only if RAG is unavailable
- Returns sources for transparency

### 2. Enhanced Chat v2 (`src/app/api/ai/chat-v2/route.ts`)

- Intent classification (refund, ride_status, kyc, pricing, safety)
- Multi-language support
- Uses RAG context for all intents
- Escalation detection for sensitive issues

### 3. Booking AI (`src/app/api/ai/extract-booking/route.ts`)

- Queries RAG for booking context
- Improves extraction accuracy with domain knowledge
- Handles vehicle types, locations, and special requests

## Testing the Integration

### 1. Test RAG Health
```bash
curl http://localhost:8000/health
```

### 2. Upload Test Documents
```bash
curl -X POST -F "file=@faq.pdf" http://localhost:8000/upload
```

### 3. Test Chat Endpoint
```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Can I cancel my ride?","history":[]}'
```

### 4. Test Booking Extraction
```bash
curl -X POST http://localhost:3000/api/ai/extract-booking \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Book a car from airport to downtown"}'
```

## Troubleshooting

### RAG Backend Not Responding
- Check if RAG backend is running: `curl http://localhost:8000/health`
- Verify `NEXT_PUBLIC_RAG_API_URL` in `.env.local`
- Check RAG backend logs for errors

### Poor RAG Context Quality
- Ensure documents are uploaded to RAG backend
- Check ChromaDB contents: `ls rag-demo/backend/chroma_db`
- Upload more relevant documents via `/upload` endpoint

### Gemini Fallback Activation
- If RAG fails, the system gracefully falls back to Gemini-only
- Check logs for RAG errors: `console.warn()` messages

## Performance Notes

- RAG queries add ~200-500ms latency
- Consider caching frequently asked questions
- ChromaDB similarity search is fast (<100ms) for reasonable database sizes
- Batch document uploads to avoid processing delays

## Future Enhancements

1. **Caching Layer**: Redis cache for frequently asked questions
2. **Hybrid Search**: Combine semantic + keyword search
3. **Document Management**: Admin UI for uploading/managing documents
4. **Analytics**: Track which documents are most helpful
5. **Fine-tuning**: Use Rydex-specific embedding models
6. **Multi-language Embeddings**: Support embeddings in multiple languages
