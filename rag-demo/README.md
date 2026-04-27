# RAG Application Demo (FastAPI + Streamlit + ChromaDB)

This is a Retrieval-Augmented Generation (RAG) boilerplate application using FastAPI for the backend, Streamlit for the frontend, and ChromaDB for the local vector database.

## Prerequisites

- Python 3.9+
- pip

## Setup & Installation

We recommend using a Python virtual environment.

### 1. Setup the Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Start the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```
The backend will be running at `http://localhost:8000` (API documentation at `http://localhost:8000/docs`).

### 2. Setup the Frontend

Open a **new terminal window**.

```bash
cd frontend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Start the Streamlit UI:
```bash
streamlit run app.py
```
The frontend will be available at `http://localhost:8501`.

## How it works

1. Open the Streamlit UI in your browser.
2. Upload a PDF or TXT file using the sidebar.
3. The file is sent to the FastAPI backend, where it is parsed, chunked, and embedded using a local HuggingFace embedding model (`all-MiniLM-L6-v2`). The vectors are stored in a local ChromaDB folder (`backend/chroma_db`).
4. Type a query in the main search bar to retrieve the most relevant document chunks based on semantic similarity!
