from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
import os
import shutil
from typing import List, Optional

from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

app = FastAPI(title="Vector DB RAG Backend")

# Setup Chroma DB directory
CHROMA_DB_DIR = "./chroma_db"
os.makedirs("uploads", exist_ok=True)

# Initialize embeddings model (Local HuggingFace model)
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Initialize Chroma Vector Store
vector_store = Chroma(
    collection_name="rag_documents",
    embedding_function=embeddings,
    persist_directory=CHROMA_DB_DIR
)

class QueryRequest(BaseModel):
    query: str
    top_k: int = 3

class ChatRequest(BaseModel):
    question: str
    top_k: int = 3

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Uploads a file, extracts text, splits it, and stores in ChromaDB."""
    file_path = f"uploads/{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        if file.filename.endswith(".pdf"):
            loader = PyPDFLoader(file_path)
        elif file.filename.endswith(".txt"):
            loader = TextLoader(file_path)
        else:
            os.remove(file_path)
            raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported")
            
        documents = loader.load()
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_documents(documents)
        
        vector_store.add_documents(chunks)
        
        os.remove(file_path)
        
        return {"message": f"Successfully processed {len(chunks)} chunks from {file.filename}"}
        
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def query_documents(request: QueryRequest):
    """Query the vector database for relevant documents."""
    results = vector_store.similarity_search_with_score(request.query, k=request.top_k)
    
    formatted_results = []
    for doc, score in results:
        formatted_results.append({
            "content": doc.page_content,
            "metadata": doc.metadata,
            "score": float(score) # lower score typically means more similar in some distance metrics
        })
        
    return {"query": request.query, "results": formatted_results}

@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Chat endpoint that retrieves context from vector store.
    Returns relevant documents as context that can be used with an LLM.
    """
    try:
        results = vector_store.similarity_search_with_score(request.question, k=request.top_k)

        formatted_results = []
        context_text = ""

        for doc, score in results:
            formatted_results.append({
                "content": doc.page_content,
                "metadata": doc.metadata,
                "score": float(score)
            })
            context_text += f"{doc.page_content}\n\n"

        return {
            "question": request.question,
            "context": context_text.strip(),
            "sources": formatted_results,
            "source_count": len(formatted_results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "healthy", "vector_db": "Chroma"}
