from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

# Create SQLite engine
DATABASE_URL = "sqlite:///./rag_agent.db"
engine = create_engine(DATABASE_URL)

# Create declarative base
Base = declarative_base()

# Define models
class DBChat(Base):
    __tablename__ = "chats"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="New Chat")
    
    # Relationship to messages
    messages = relationship("DBMessage", back_populates="chat", cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name
        }

class DBMessage(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer)  
    type = Column(String)  
    body = Column(Text)
    chat_id = Column(Integer, ForeignKey("chats.id"))
    
    # Relationship to chat
    chat = relationship("DBChat", back_populates="messages")
    
    def to_dict(self):
        return {
            "id": self.message_id,
            "type": self.type,
            "body": self.body
        }

# Create tables
Base.metadata.create_all(bind=engine)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Helper function to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()