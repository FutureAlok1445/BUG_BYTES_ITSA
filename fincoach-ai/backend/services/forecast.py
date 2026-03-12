def calculate_forecast(income: float, spent: float, current_day_of_month: int) -> int:
    import calendar
    from datetime import datetime
    
    current_day = max(1, current_day_of_month)
    now = datetime.now()
    days_in_month = calendar.monthrange(now.year, now.month)[1]
    
    projected_total_spend = (spent / current_day) * days_in_month
    forecast_balance = income - projected_total_spend
    
    return int(round(forecast_balance))
