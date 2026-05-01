from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/chat", tags=["Chat"])

class ChatMessage(BaseModel):
    message: str

@router.post("/")
def send_chat(chat: ChatMessage) -> dict:
    return {"reply": f"Received: {chat.message}"}
