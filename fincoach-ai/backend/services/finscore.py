"""
FinScore Engine — calculates a 0-100 behavioral financial health score.
"""


def calculate_finscore(income: float, spent: float, goals: list, streak_days: int) -> int:
    """
    Calculate FinScore (0-100) based on:
    - Savings rate    (0-40 pts)
    - Consistency     (0-20 pts)
    - Goal progress   (0-20 pts)
    - Alert score     (0-10 pts)
    - Streak bonus    (0-10 pts)
    """
    # Edge case: no income
    if income <= 0:
        return 0

    # Savings rate component (40 pts max)
    savings_rate = max(0.0, (income - spent) / income)
    savings_score = min(savings_rate / 0.5, 1.0) * 40

    # Consistency component (20 pts max)
    consistency_score = 20 if savings_rate > 0.10 else 10

    # Goal progress component (20 pts max)
    if goals:
        progress_list = []
        for g in goals:
            target = g.get("target_amount", 1)
            target = target if target > 0 else 1
            progress = min(g.get("current_amount", 0) / target, 1.0)
            progress_list.append(progress)
        avg_goal_progress = sum(progress_list) / len(progress_list)
    else:
        avg_goal_progress = 0

    goal_score = avg_goal_progress * 20

    # Alert score (10 pts max) — bonus if not overspending
    alert_score = 10 if spent < income * 0.85 else 0

    # Streak bonus (10 pts max)
    streak_bonus = 10 if streak_days >= 7 else 0

    total = savings_score + consistency_score + goal_score + alert_score + streak_bonus
    return int(min(max(total, 0), 100))
