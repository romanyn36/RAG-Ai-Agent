from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List
from agent import agent_executor
from langchain.agents import Tool
from vector_database import get_vector_db, process_files
import os
import shutil

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploaded_files"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global variables
_vector_store = None
_retriever = None


# File upload and processing
@app.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    # save uploaded files to the server
    files_paths = []
    for file in files:
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        files_paths.append(file_path)
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
    process_files(files_paths=files_paths)
    return {"message": "Files uploaded and processed successfully."}

# Chat endpoint
@app.post("/chat")
async def chat(query: str = Form(...),agent: bool = Form(False)):
    response = agent_executor(query_text=query, agent=agent)
    return {"response": response}
