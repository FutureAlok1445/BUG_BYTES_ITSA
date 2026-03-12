"""
Financial forecast and weekly budget calculation.
"""
import calendar
from datetime import datetime


def calculate_forecast(income: float, spent: float, current_day: int) -> int:
    """
    Calculate month-end balance forecast.
    Returns projected remaining balance (can be negative).
    """
    now = datetime.now()
    days_in_month = calendar.monthrange(now.year, now.month)[1]
    current_day = max(1, current_day)
    daily_rate = spent / current_day
    projected_total = daily_rate * days_in_month
    return int(round(income - projected_total))


def calculate_weekly_budget(income: float, spent: float, current_day: int) -> dict:
    """
    Calculate weekly budget guide for irregular income earners.
    Returns budget breakdown with daily safe limits.
    """
    now = datetime.now()
    days_in_month = calendar.monthrange(now.year, now.month)[1]
    current_day = max(1, current_day)
    remaining_days = max(1, days_in_month - current_day)
    remaining_budget = max(0, income - spent)

    daily_safe_limit = remaining_budget / remaining_days
    this_week_budget = daily_safe_limit * 7
    # Estimate this week spent as average of daily rate * days into current week
    day_of_week = now.weekday()  # 0=Monday
    days_into_week = day_of_week + 1
    daily_rate = spent / current_day if current_day > 0 else 0
    this_week_spent = round(daily_rate * days_into_week, 2)

    return {
        "this_week_budget": round(this_week_budget, 2),
        "this_week_spent": this_week_spent,
        "remaining_today": round(daily_safe_limit, 2),
        "daily_safe_limit": round(daily_safe_limit, 2)
    }
