import os
import openai 
import shutil
from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader,TextLoader, PyPDFLoader, UnstructuredMarkdownLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from typing import Optional

load_dotenv()
openai.api_key=os.environ.get('OPENAI_API_KEY')
CHROMA_PATH='chroma_db'

# Global variable for vector database
_vector_db = None

def get_vector_db():
    """
    Returns the global vector database instance.
    """
    global _vector_db
    if _vector_db is None:
        if os.path.exists(CHROMA_PATH):
            _vector_db = Chroma(
                persist_directory=CHROMA_PATH,
                embedding_function=OpenAIEmbeddings()
            )
            print(f"Loaded existing vector database from {CHROMA_PATH}")
        else:
            print("No existing vector database found.")
    return _vector_db

def save_chomadb(chunks, overwrite=False):
    """
    Save documents to Chroma DB
    Args:
        chunks: Document chunks to save
        overwrite: Whether to overwrite existing DB or extend it
    """
    global _vector_db
    
    if overwrite and os.path.exists(CHROMA_PATH):
        shutil.rmtree(CHROMA_PATH)
        _vector_db = None  
    
    if _vector_db is None:
        # Create new DB
        _vector_db = Chroma.from_documents(
            chunks, 
            OpenAIEmbeddings(),
            persist_directory=CHROMA_PATH
        )
        print(f"Created new vector database with {len(chunks)} chunks.")
    else:
        # Add new documents to existing DB
        _vector_db.add_documents(chunks)
        print(f"Added {len(chunks)} chunks to existing vector database.")
    
    return _vector_db

def query_data(query_text: str, similarity_threshold: float = 0.7, k: int = 3):    
    # Use the global vector db instance
    vector_db = get_vector_db()
    
    if vector_db is None:
        print("No vector database available. Please create one first.")
        return []
    
    # get relevant queries
    results = vector_db.similarity_search_with_relevance_scores(query=query_text, k=k)
    if len(results) == 0 or results[0][1] < similarity_threshold:
        print(f"Unable to find matching results.")
        return []
    results = sorted(results, key=lambda x: x[1], reverse=True)[:k]
    return results

def close_vector_db():
    """
    Close the vector database and release resources
    """
    global _vector_db
    if _vector_db is not None:
        _vector_db = None
        print("Vector database connection closed.")
        
# ----------------------------
# File upload and processing
def load_documents(files_paths:list):
    """
    load files"""
    documents = []
    for file_path in files_paths:
        if file_path.endswith('.pdf'):
            loader = PyPDFLoader(file_path)
        elif file_path.endswith('.md'):
            loader = UnstructuredMarkdownLoader(file_path)
        elif file_path.endswith('.txt'):
            # Try with UTF-8 encoding first, fallback to other encodings if needed
            try:
                loader = TextLoader(file_path, encoding='utf-8')
                documents.extend(loader.load())
            except UnicodeDecodeError:
                # Try with latin-1 
                try:
                    loader = TextLoader(file_path, encoding='latin-1')
                    documents.extend(loader.load())
                except Exception as e:
                    print(f"Error loading {file_path}: {str(e)}")
                    continue
            continue  
        else:
            raise ValueError(f"Unsupported file type: {file_path}")
        
        documents.extend(loader.load())
    
    print(f"Loaded {len(documents)} documents from {len(files_paths)} files.")
    return documents

def text_spliter(documents):
    """
    split documents to chunks"""
    text_spliter=RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100,
        length_function=len,
        add_start_index=True
    )
    chunks=text_spliter.split_documents(documents)
    # logging
    print(f"Split {len(documents)} documents into {len(chunks)} chunks.")
    return chunks



def process_files(files_paths=None, overwrite=False):
    """
    Process files and save to vector database
    """
    try:
        if files_paths:
            documents = load_documents(files_paths)
        else:
            raise ValueError("Either files_path or directory_path must be provided.")
        
        chunks = text_spliter(documents)
        
        # Save to vector database
        save_chomadb(chunks, overwrite=overwrite)
    except Exception as e:
        print(f"Error processing files: {e}")
        return False, str(e)
    return True, "Files processed and saved to vector database successfully."
    
get_vector_db()