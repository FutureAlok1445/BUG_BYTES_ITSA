"""
Alert generation engine — produces actionable financial alerts with codes.
"""
import calendar
from datetime import datetime


def generate_alerts(income: float, spent: float, categories: dict, forecast: int = 0) -> list:
    """
    Generate prioritized financial alerts based on spending patterns.
    Each alert: {type: danger/warning/success/info, msg: str, code: str}
    """
    alerts = []
    has_risk = False

    now = datetime.now()
    days_in_month = calendar.monthrange(now.year, now.month)[1]
    current_day = max(1, now.day)
    projected_spend = (spent / current_day) * days_in_month

    # 1. Critical overspend (> 90% of income)
    if income > 0 and spent > income * 0.90:
        overspend = max(0, projected_spend - income)
        spent_pct = round((spent / income) * 100)
        alerts.append({
            "type": "danger",
            "msg": f"🔴 Critical! Spent {spent_pct}% of income. Projected overspend: ₹{round(overspend)}",
            "code": "CRITICAL_OVERSPEND"
        })
        has_risk = True

    # 2. High spend (> 75% of income)
    elif income > 0 and spent > income * 0.75:
        spent_pct = round((spent / income) * 100)
        alerts.append({
            "type": "warning",
            "msg": f"🟡 Spending at {spent_pct}% of income. Tighten up this week.",
            "code": "HIGH_SPEND"
        })
        has_risk = True

    # 3. Food overspend (> 25% of income)
    food_spent = categories.get("Food", 0)
    if income > 0 and food_spent > income * 0.25:
        food_pct = round((food_spent / income) * 100)
        alerts.append({
            "type": "warning",
            "msg": f"🟡 Food ₹{food_spent} = {food_pct}% of income. Healthy limit: 20%",
            "code": "FOOD_OVERSPEND"
        })
        has_risk = True

    # 4. Entertainment high (> ₹2500)
    ent_spent = categories.get("Entertainment", 0)
    if ent_spent > 2500:
        excess = ent_spent - 2500
        alerts.append({
            "type": "warning",
            "msg": f"🟡 Entertainment ₹{ent_spent} this month. Consider cutting ₹{excess}",
            "code": "ENTERTAINMENT_HIGH"
        })
        has_risk = True

    # 5. Low forecast (< ₹2000)
    if forecast < 2000:
        alerts.append({
            "type": "danger",
            "msg": f"🔴 Only ₹{forecast} projected at month end. Act now!",
            "code": "LOW_FORECAST"
        })
        has_risk = True

    # 6. All good
    if not has_risk:
        alerts.append({
            "type": "success",
            "msg": "✅ No major financial risks this month. Keep going!",
            "code": "ALL_GOOD"
        })

    # Always append forecast info
    forecast_balance = int(round(income - projected_spend))
    month_end_date = f"{days_in_month} {now.strftime('%b')}"
    alerts.append({
        "type": "info",
        "msg": f"📅 Month-end forecast: ₹{forecast_balance} remaining ({month_end_date})",
        "code": "FORECAST"
    })

    return alerts
