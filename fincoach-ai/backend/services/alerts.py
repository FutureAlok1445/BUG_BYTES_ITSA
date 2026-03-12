import calendar
from datetime import datetime

def generate_alerts(income: float, spent: float, categories: dict) -> list:
    alerts = []
    has_risk = False
    
    now = datetime.now()
    days_in_month = calendar.monthrange(now.year, now.month)[1]
    current_day = max(1, now.day)
    projected_spend = (spent / current_day) * days_in_month
    
    if income > 0 and spent > income * 0.90:
        overspend = projected_spend - income
        spent_pct = round((spent / income) * 100)
        alerts.append({"type": "danger", "msg": f"🔴 Critical! Spent {spent_pct}% of income. Projected to overspend by ₹{round(max(0, overspend))}"})
        has_risk = True
    elif income > 0 and spent > income * 0.75:
        spent_pct = round((spent / income) * 100)
        alerts.append({"type": "warning", "msg": f"🟡 Spending at {spent_pct}% of income. Tighten up this week."})
        has_risk = True

    food_spent = categories.get("Food", 0)
    if income > 0 and food_spent > income * 0.25:
        food_pct = round((food_spent / income) * 100)
        alerts.append({"type": "warning", "msg": f"🟡 Food spending ₹{food_spent} is {food_pct}% of income. Healthy limit is 20%."})
        has_risk = True

    ent_spent = categories.get("Entertainment", 0)
    if ent_spent > 2500:
        cut_amount = ent_spent - 2500
        alerts.append({"type": "warning", "msg": f"🟡 Entertainment ₹{ent_spent} this month. Consider cutting ₹{cut_amount}."})
        has_risk = True
        
    if not has_risk:
        alerts.append({"type": "success", "msg": "✅ Great job! No major financial risks this month."})
        
    forecast_balance = int(round(income - projected_spend))
    month_end_date = f"{days_in_month} {now.strftime('%b')}"
    alerts.append({"type": "info", "msg": f"📅 At current pace, you'll have ₹{forecast_balance} on {month_end_date}"})
    
    return alerts
