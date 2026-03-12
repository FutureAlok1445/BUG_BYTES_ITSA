import re
from fastapi import APIRouter, HTTPException
from routes.dashboard import get_dashboard
from services.groq_ai import get_ai_insights
from db import update_personality

router = APIRouter()

@router.get("/insights")
def get_insights():
    print("GET /api/insights hit")
    user_id = "user_001"
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
            "goals": [{"name": g["name"], "target": g.get("target_amount", g.get("target")), "current": g.get("current_amount", g.get("current"))} for g in dashboard_data["goals"]],
        }
        
        insights_text = get_ai_insights(context_dict)
        
        personality = dashboard_data["profile"]["personality_type"]
        match = re.search(r'(?:Personality|spending personality type)\s*:\s*(.*)', insights_text, re.IGNORECASE)
        if match:
            personality = match.group(1).strip()
            update_personality(user_id, personality)
        
        return {
            "insights": insights_text,
            "personality": personality
        }
    except Exception as e:
        print(f"Error in get_insights: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while generating insights")
