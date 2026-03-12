from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from routes.dashboard import get_dashboard
from services.groq_ai import chat_with_coach

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
def handle_chat(req: ChatRequest):
    print(f"POST /api/chat hit with message length: {len(req.message)}")
    try:
        dashboard_data = get_dashboard()
        
        context_dict = {
            "name": dashboard_data["profile"]["name"],
            "finscore": dashboard_data["profile"]["finscore"],
            "personality": dashboard_data["profile"]["personality_type"],
            "streak": dashboard_data["profile"]["streak_days"],
            "income": dashboard_data["income"],
            "spent": dashboard_data["spent"],
            "saved": dashboard_data["saved"],
            "categories": dashboard_data["categories"],
            "alerts": [a["msg"] for a in dashboard_data["alerts"]],
        }
        
        reply = chat_with_coach(context_dict, req.message)
        
        return {"reply": reply}
    except Exception as e:
        print(f"Error in handle_chat: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during chat")
