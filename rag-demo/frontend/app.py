import streamlit as st
import requests

# FastAPI Backend URL
BACKEND_URL = "http://localhost:8000"

st.set_page_config(page_title="RAG Semantic Search", page_icon="🔍", layout="wide")

st.title("📚 RAG Semantic Search with Vector DB")
st.markdown("Upload your documents (PDF/TXT) and semantically search through them!")

# Sidebar for file uploads
with st.sidebar:
    st.header("Upload Documents")
    uploaded_file = st.file_uploader("Choose a file", type=["pdf", "txt"])
    
    if st.button("Upload"):
        if uploaded_file is not None:
            with st.spinner("Uploading and indexing document..."):
                files = {"file": (uploaded_file.name, uploaded_file.getvalue(), uploaded_file.type)}
                response = requests.post(f"{BACKEND_URL}/upload", files=files)
                
                if response.status_code == 200:
                    st.success(response.json()["message"])
                else:
                    st.error(f"Error: {response.text}")
        else:
            st.warning("Please select a file to upload.")

# Main area for querying
st.header("Search Documents")

query = st.text_input("Enter your search query:")
top_k = st.slider("Number of results (Top K)", min_value=1, max_value=10, value=3)

if st.button("Search"):
    if query:
        with st.spinner("Searching..."):
            payload = {"query": query, "top_k": top_k}
            try:
                response = requests.post(f"{BACKEND_URL}/query", json=payload)
                
                if response.status_code == 200:
                    results = response.json()["results"]
                    
                    if not results:
                        st.info("No matching documents found.")
                    else:
                        for i, res in enumerate(results):
                            with st.expander(f"Result {i+1} (Score: {res['score']:.4f})", expanded=True):
                                st.markdown(f"**Source:** {res['metadata'].get('source', 'Unknown')}")
                                if 'page' in res['metadata']:
                                    st.markdown(f"**Page:** {res['metadata']['page']}")
                                st.text_area("Content", res['content'], height=150, disabled=True)
                else:
                    st.error(f"Backend error: {response.text}")
            except requests.exceptions.ConnectionError:
                st.error("Could not connect to backend. Is the FastAPI server running on port 8000?")
    else:
        st.warning("Please enter a query.")
