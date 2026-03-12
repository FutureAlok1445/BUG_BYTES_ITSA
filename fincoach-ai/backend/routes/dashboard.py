"""
Dashboard route — the main data endpoint for the frontend.
Returns complete financial snapshot with fallback to mock data.
"""
from fastapi import APIRouter, Request, HTTPException
from datetime import datetime
from db import (
    get_profile, get_monthly_totals, get_transactions_by_category,
    get_weekly_trend, get_all_goals, MOCK_DASHBOARD_DATA
)
from services.finscore import calculate_finscore
from services.alerts import generate_alerts
from services.forecast import calculate_forecast, calculate_weekly_budget
from security.rate_limiter import limiter, DEFAULT_LIMIT

router = APIRouter()


@router.get("/dashboard")
@limiter.limit(DEFAULT_LIMIT)
def get_dashboard(request: Request):
    """Get complete financial dashboard data for the demo user."""
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
        now = datetime.now()

        finscore = calculate_finscore(income, spent, goals, streak_days)
        forecast = calculate_forecast(income, spent, now.day)
        alerts = generate_alerts(income, spent, categories, forecast)
        weekly_budget = calculate_weekly_budget(income, spent, now.day)

        # Add progress_pct to each goal
        for g in goals:
            target = g.get("target_amount", 1)
            current = g.get("current_amount", 0)
            g["progress_pct"] = round((current / target * 100) if target > 0 else 0)

        return {
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
            "savings_rate": round(savings_rate, 4),
            "categories": categories,
            "weekly_trend": weekly_trend,
            "goals": goals,
            "alerts": alerts,
            "forecast": forecast,
            "weekly_budget": weekly_budget
        }
    except Exception as e:
        print(f"Dashboard error (returning mock data): {e}")
        return MOCK_DASHBOARD_DATA
