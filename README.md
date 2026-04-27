# 🚖 Rydex - AI Powered Ride Booking Platform (RAG Integrated)

Rydex is a full-stack ride booking and partner management platform inspired by real-world ride-hailing applications. It supports ride booking, partner dashboards, booking management, real-time updates using Socket.IO, and now includes an **AI-powered RAG chatbot module** integrated with the main system.

The AI chatbot uses **Retrieval-Augmented Generation (RAG)** to answer queries based on stored documents/data using a Vector Database and Gemini API.

---

## ✨ Key Features

### 👤 User Features
- User authentication and profile management
- Ride booking interface
- Ride details and tracking page
- Booking history

### 🤝 Partner Features
- Partner dashboard
- Active ride management
- View and manage bookings
- Vendor/partner UI components

### 🔥 Real-time Features
- Real-time communication using Socket.IO
- Live ride updates and booking events

### 🤖 AI Features (RAG Integration)
- AI-powered chatbot for support and information retrieval
- Uses Vector Database for semantic search
- Gemini LLM integration for response generation
- Document-based Q&A (reduces hallucination)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (React), TypeScript, Tailwind CSS |
| **Backend** | Node.js / Express, FastAPI |
| **AI / RAG** | Gemini API, ChromaDB / FAISS, Embeddings |
| **Real-time** | Socket.IO |
| **DevOps** | Docker, Docker Compose |

---

## 📂 Project Structure

```
Rydex/
│
├── backend/               # Backend service (Node/Express API)
├── rydex/                 # Frontend Next.js application
├── socketServer/          # Socket.IO server for real-time updates
├── rag-demo/              # RAG module (FastAPI + Vector DB + Gemini)
│   ├── backend/           # FastAPI backend for RAG
│   └── frontend/          # Optional Streamlit admin/testing UI
├── docker-compose.yml     # Docker compose configuration
└── README.md              # Documentation
```

---

## 🚀 Getting Started

### ✅ Prerequisites

Make sure you have installed:

- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

Verify your installation:

```bash
docker --version
docker compose version
```

---

### 🔑 Environment Setup (Important)

#### Gemini API Key

Create a `.env` file inside `rag-demo/backend/`:

```
rag-demo/backend/.env
```

Add your key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ **Never upload `.env` to GitHub.**

---

## 🐳 Run Full Project Using Docker

**Clone the repository:**

```bash
git clone https://github.com/akarshra/Rydex.git
cd Rydex
```

**Run the complete system:**

```bash
docker compose up --build
```

**Run in background:**

```bash
docker compose up -d --build
```

**Stop containers:**

```bash
docker compose down
```

---

## 🌐 Access Application

After running Docker Compose, open in your browser:

| Service | URL |
|---|---|
| Rydex Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Socket Server | http://localhost:5000 |
| RAG Backend (FastAPI) | http://localhost:9000 |

> ⚠️ If ports differ, check the `docker-compose.yml` file.

---

## 🤖 Rydex AI Chatbot (RAG)

The chatbot works using this pipeline:

1. Documents are **chunked** into smaller parts
2. Chunks are converted into **embeddings**
3. Embeddings are stored in a **Vector Database**
4. When a user asks a question:
   - Relevant chunks are **retrieved** from Vector DB
   - **Gemini** generates an answer using retrieved context
   - Answer is returned to the Rydex UI

This improves accuracy and **reduces hallucinations**.

---

## 🧪 Run RAG Module Manually (Optional)

**Run RAG Backend:**

```bash
cd rag-demo/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 9000
```

**Run Streamlit Frontend (Optional):**

```bash
cd rag-demo/frontend
pip install -r requirements.txt
streamlit run app.py
```

---

## 📌 Future Enhancements

- [ ] Add RAG evaluation metrics using RAGAS / DeepEval
- [ ] Add role-based authentication (Admin / User / Partner)
- [ ] Add Kubernetes deployment manifests
- [ ] Add CI/CD pipeline using GitHub Actions
- [ ] Improve ride tracking and map integration
- [ ] Production deployment with Nginx + Load Balancer

---

## 👨‍💻 Author

**Akarsh Raj**  
GitHub: [https://github.com/akarshra](https://github.com/akarshra)

---

## ⭐ Support

If you like this project, give it a ⭐ on [GitHub](https://github.com/akarshra/Rydex)!
