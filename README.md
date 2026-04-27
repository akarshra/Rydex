# 🚖 Rydex - AI Powered Ride Booking Platform (RAG Integrated)

Rydex is a full-stack ride booking and partner management platform inspired by real-world ride-hailing applications.  
It supports ride booking, partner dashboards, booking management, real-time updates using Socket.IO, and now includes an **AI-powered RAG chatbot module** integrated with the main system.

The AI chatbot uses **Retrieval-Augmented Generation (RAG)** to answer queries based on stored documents/data using a **Vector Database** and **Gemini API**.

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
- Real-time communication using **Socket.IO**
- Live ride updates and booking events

### 🤖 AI Features (RAG Integration)
- AI-powered chatbot for support and information retrieval
- Uses **Vector Database** for semantic search
- Gemini LLM integration for response generation
- Document-based Q&A (reduces hallucination)

---

## 🛠️ Tech Stack

### Frontend
- Next.js (React)
- TypeScript
- Tailwind CSS

### Backend
- Node.js / Express (Core backend services)
- FastAPI (RAG AI backend)

### AI / RAG
- Gemini API (LLM)
- Vector Database (ChromaDB / FAISS based retrieval)
- Embeddings + semantic search pipeline

### Real-time
- Socket.IO

### DevOps
- Docker
- Docker Compose

---

## 📂 Project Structure

```bash
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
🚀 Getting Started
✅ Prerequisites

Make sure you have installed:

Git
Docker
Docker Compose

Check Docker version:

docker --version
docker compose version
🔑 Environment Setup (Important)
Gemini API Key

Create a .env file inside:

rag-demo/backend/.env

Add your key:

GEMINI_API_KEY=your_gemini_api_key_here

⚠️ Never upload .env to GitHub.

🐳 Run Full Project Using Docker

Clone the repository:

git clone https://github.com/akarshra/Rydex.git
cd Rydex

Run the complete system:

docker compose up --build

Run in background:

docker compose up -d --build

Stop containers:

docker compose down
🌐 Access Application

After running Docker Compose, open in browser:

Rydex Frontend
http://localhost:3000
Backend API
http://localhost:8000
 (if configured)
Socket Server
http://localhost:5000
 (if configured)
RAG Backend (FastAPI)
http://localhost:9000
 (if configured)

⚠️ If ports differ, check the docker-compose.yml file.

🤖 Rydex AI Chatbot (RAG)

The chatbot works using this pipeline:

Documents are chunked into smaller parts
Chunks are converted into embeddings
Embeddings are stored in a Vector Database
When a user asks a question:
Relevant chunks are retrieved from Vector DB
Gemini generates an answer using retrieved context
Answer is returned to the Rydex UI

This improves accuracy and reduces hallucinations.

🧪 Run RAG Module Manually (Optional)
Run RAG Backend
cd rag-demo/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 9000
Run Streamlit Frontend (Optional)
cd rag-demo/frontend
pip install -r requirements.txt
streamlit run app.py
📌 Future Enhancements
Add RAG evaluation metrics using RAGAS / DeepEval
Add role-based authentication (Admin/User/Partner)
Add Kubernetes deployment manifests
Add CI/CD pipeline using GitHub Actions
Improve ride tracking and map integration
Production deployment with Nginx + Load Balancer
👨‍💻 Author

Akarsh Raj
GitHub: https://github.com/akarshra

⭐ Support

If you like this project, give it a ⭐ on GitHub!


---

### ✅ After saving README.md, push it:
```bash
git add README.md
git commit -m "Updated README with RAG integration"
git push origin main
