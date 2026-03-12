def calculate_finscore(income: float, spent: float, goals: list, streak_days: int) -> int:
    if income > 0:
        savings_rate = max(0.0, (income - spent) / income)
    else:
        savings_rate = 0.0

    savings_score = min((savings_rate / 0.5), 1) * 40
    consistency_score = 20 if savings_rate > 0.10 else 10

    if goals:
        progress_list = []
        for g in goals:
            target = g.get('target_amount', 1)
            target = target if target > 0 else 1
            progress = min(g.get('current_amount', 0) / target, 1)
            progress_list.append(progress)
        avg_goal_progress = sum(progress_list) / len(progress_list)
    else:
        avg_goal_progress = 0

    goal_score = avg_goal_progress * 20
    alert_score = 10 if spent < income * 0.85 else 0
    bonus = 10 if streak_days > 7 else 0

    total_score = savings_score + consistency_score + goal_score + alert_score + bonus
    return int(min(max(total_score, 0), 100))
