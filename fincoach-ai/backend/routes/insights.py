"""
Insights route — generates AI-powered financial insights with PII protection.
"""
import re
from datetime import datetime
from fastapi import APIRouter, Request, HTTPException
from routes.dashboard import get_dashboard
from services.groq_ai import get_ai_insights
from services.data_sanitizer import build_safe_ai_context
from db import update_personality
from security.rate_limiter import limiter, INSIGHTS_LIMIT

router = APIRouter()


@router.get("/insights")
@limiter.limit(INSIGHTS_LIMIT)
def get_insights(request: Request):
    """Generate AI-powered financial insights. Rate limited: 5/min."""
    user_id = "user_001"
    try:
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
            "goals": dashboard_data["goals"],
        })

        insights_text, is_fallback = get_ai_insights(safe_context)

        # Try to extract personality from AI response
        personality = dashboard_data["profile"]["personality_type"]
        match = re.search(r'(?:Personality|spending personality type)\s*:\s*(.*)', insights_text, re.IGNORECASE)
        if match:
            personality = match.group(1).strip()
            update_personality(user_id, personality)

        return {
            "insights": insights_text,
            "personality": personality,
            "generated_at": datetime.now().isoformat(),
            "is_fallback": is_fallback
        }
    except Exception as e:
        print(f"Insights error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate insights")
