from fastapi import APIRouter, HTTPException
from datetime import datetime
from db import (
    get_profile, get_monthly_totals, get_transactions_by_category,
    get_weekly_trend, get_all_goals
)
from services.finscore import calculate_finscore
from services.alerts import generate_alerts
from services.forecast import calculate_forecast

router = APIRouter()

@router.get("/dashboard")
def get_dashboard():
    print("GET /api/dashboard hit")
    user_id = "user_001"
    try:
        profile = get_profile(user_id) or {}
        totals = get_monthly_totals(user_id) or {"income": 0, "spent": 0}
        income = totals.get("income", 0)
        spent = totals.get("spent", 0)
        
        saved = max(0, income - spent)
        savings_rate = (saved / income) if income > 0 else 0
        
        categories = get_transactions_by_category(user_id) or {}
        weekly_trend = get_weekly_trend(user_id) or {}
        goals = get_all_goals(user_id) or []
        
        streak_days = profile.get("streak_days", 0)
        
        finscore = calculate_finscore(income, spent, goals, streak_days)
        alerts = generate_alerts(income, spent, categories)
        
        now = datetime.now()
        forecast = calculate_forecast(income, spent, now.day)
        
        profile["finscore"] = finscore
        
        dashboard_data = {
            "profile": {
                "name": profile.get("name", "User"),
                "finscore": finscore,
                "personality_type": profile.get("personality_type", "Unknown"),
                "streak_days": streak_days,
                "income_type": profile.get("income_type", "Unknown")
            },
            "income": income,
            "spent": spent,
            "saved": saved,
            "savings_rate": savings_rate,
            "categories": categories,
            "weekly_trend": weekly_trend,
            "goals": goals,
            "alerts": alerts,
            "forecast": forecast
        }
        
        return dashboard_data
    except Exception as e:
        print(f"Error in get_dashboard: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while fetching dashboard")
