"""
Chat route — real-time AI financial coaching with prompt injection protection.
"""
import logging
from datetime import datetime
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from routes.dashboard import get_dashboard
from services.groq_ai import chat_with_coach
from services.data_sanitizer import build_safe_ai_context
from security.input_validator import validate_chat_message
from security.rate_limiter import limiter, CHAT_LIMIT

logger = logging.getLogger("fincoach.chat")
router = APIRouter()


class ChatRequest(BaseModel):
    """Chat request body."""
    message: str


@router.post("/chat")
@limiter.limit(CHAT_LIMIT)
def handle_chat(req: ChatRequest, request: Request):
    """Chat with AI financial coach. Rate limited: 10/min."""
    try:
        # Validate and sanitize message (blocks prompt injection)
        try:
            clean_message = validate_chat_message(req.message)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        # Log timestamp + length (NOT the message content for privacy)
        logger.info(f"Chat request: {datetime.now().isoformat()} | length={len(clean_message)}")

        dashboard_data = get_dashboard(request)

        # Build safe context (strips PII)
        safe_context = build_safe_ai_context({
            "name": dashboard_data["profile"]["name"],
            "finscore": dashboard_data["profile"]["finscore"],
            "personality_type": dashboard_data["profile"]["personality_type"],
            "streak_days": dashboard_data["profile"]["streak_days"],
            "income": dashboard_data["income"],
            "spent": dashboard_data["spent"],
            "saved": dashboard_data["saved"],
            "categories": dashboard_data["categories"],
            "alerts": dashboard_data["alerts"],
        })

        reply, is_fallback = chat_with_coach(safe_context, clean_message)

        return {"reply": reply, "is_fallback": is_fallback}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Chat service unavailable")
