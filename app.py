import os
import json
import shutil
from typing import List
from fastapi import Depends
from pydantic import BaseModel
from agent import agent_executor
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from database import get_db, DBChat, DBMessage
from fastapi.middleware.cors import CORSMiddleware
from vector_database import get_vector_db, process_files
from fastapi import FastAPI, File, UploadFile, Form,HTTPException,status



# app configurations
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


class Chat(BaseModel):
    id: int = 0
    name: str = "New Chat"
    
    def dict(self):
        return {"id": self.id, "name": self.name}

class Message(BaseModel):
    id: int
    type: str  # "user" or "agent"
    body: str
    reasoning_steps: List[dict] = []  
    class Config:
        orm_mode = True
    
    def dict(self):
        return {"id": self.id, "type": self.type, "body": self.body}

@app.get("/api/chats/", response_model=List[Chat])
async def get_chats(db: Session = Depends(get_db)):
    chats = db.query(DBChat).all()
    chats_serialized = jsonable_encoder(chats)
    return JSONResponse(content=chats_serialized)

# new chat
@app.post("/api/chats/new/")
async def new_chat(db: Session = Depends(get_db)):
    new_chat = DBChat(name="New Chat")
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return JSONResponse(content={"detail": "New chat created successfully.", "chat_id": new_chat.id})



@app.get("/api/chats/{chat_id}/messages/")
async def get_chat_messages(chat_id: int, db: Session = Depends(get_db)):
    messages = db.query(DBMessage).filter(DBMessage.chat_id == chat_id).all()
    messages_serialized = jsonable_encoder(messages)
    return JSONResponse(content=messages_serialized)

# rename chat
@app.put("/api/chats/{chat_id}/rename/")
async def rename_chat(chat_id: int, payload: dict, db: Session = Depends(get_db)):
    chat = db.query(DBChat).filter(DBChat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    
    name = payload.get("name")
    if not name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Name is required")
    
    chat.name = name
    db.commit()
    
    return JSONResponse(content={"detail": "Chat renamed successfully."})


@app.delete("/api/chats/{chat_id}/delete")
async def delete_chat(chat_id: int, db: Session = Depends(get_db)):
    # Find the chat
    chat = db.query(DBChat).filter(DBChat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    
    # Delete associated messages first to maintain referential integrity
    db.query(DBMessage).filter(DBMessage.chat_id == chat_id).delete()
    
    # Delete the chat
    db.delete(chat)
    db.commit()
    
    # Delete files in the chat folder if they exist
    chat_folder = os.path.join(UPLOAD_FOLDER, str(chat_id))
    if os.path.exists(chat_folder):
        shutil.rmtree(chat_folder)
    
    return JSONResponse(content={"detail": "Chat deleted successfully."})


@app.post("/api/chats/{chat_id}/send/")
async def send_chat_message(
    chat_id: str, 
    query: str = Form(default=""), 
    agent: bool = Form(default=False),
    files: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db)
):
    
    # Handle chat creation for new chats
    if chat_id == 'newChat':
        new_chat = DBChat(name="New Chat")
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)
        chat_id = new_chat.id
    else:
        try:
            chat_id = int(chat_id)
            chat = db.query(DBChat).filter(DBChat.id == chat_id).first()
            if not chat:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid chat ID")
    
    # Process files if any were uploaded
    files_paths = []
    files_message = ""
    if files:
        # Handle file uploads
        for file in files:
            if file.filename == "":
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file name")
            if not file.filename.endswith(('.txt', '.pdf', '.docx')):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type")
            chat_folder = os.path.join(UPLOAD_FOLDER, str(chat_id))
            os.makedirs(chat_folder, exist_ok=True)
            file_path = os.path.join(chat_folder, file.filename)
            files_paths.append(file_path)
            with open(file_path, "wb") as f:
                shutil.copyfileobj(file.file, f)
  
        success, files_message = process_files(files_paths=files_paths)
        if not success:
            # Clean up uploaded files if processing fails
            # for file_path in files_paths:
            #     if os.path.exists(file_path):
            #         os.remove(file_path)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=files_message)
        
        files_message = f"{files_message}: {', '.join([file.filename for file in files])}"
    
    # Add user message to chat
    user_message_body = query if query else "Files uploaded" if files else "Empty message"
    user_message = DBMessage(chat_id=chat_id, type="user", body=user_message_body)
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    
    # Generate response
    reasoning_steps = []
    if query and query != "":
        response = agent_executor(query_text=query, agent=agent)
        final_response = response['response']  
        if response['sources']:
            final_response += '\n\nSources:\n' + "\n".join(response['sources'])
        reasoning_steps = response['reasoning_steps']
        
    elif files:
        # If only files were uploaded with no query
        final_response = files_message
    else:
        final_response = "I received your message but it appears to be empty. How can I assist you?"
    
    # Add agent message to chat
    agent_message = DBMessage(chat_id=chat_id, type="agent", body=final_response, reasoning_steps=json.dumps(reasoning_steps))
    db.add(agent_message)
    db.commit()
    db.refresh(agent_message)
    
    # Get the chat to return its name
    chat = db.query(DBChat).filter(DBChat.id == chat_id).first()
    
    return JSONResponse(content={
        'agent_response': {
            'id': agent_message.id,
            'type': agent_message.type,
            'body': agent_message.body,
            'reasoning_steps': reasoning_steps,
        },
        'chat_id': chat_id,
        'chat_name': chat.name
    })