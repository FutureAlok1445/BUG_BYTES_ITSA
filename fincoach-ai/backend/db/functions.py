def get_all_transactions(user_id): return []
def get_monthly_totals(user_id): return {"income": 50000, "spent": 30000}
def get_transactions_by_category(user_id): return {"Food": 15000, "Entertainment": 3000}
def get_weekly_trend(user_id): return {"W1": 5000, "W2": 7000, "W3": 8000, "W4": 10000}
def get_all_goals(user_id): return [{"name": "Laptop", "target_amount": 50000, "current_amount": 10000, "deadline": "2026-12-31"}]
def insert_transaction(user_id, data): return "tx_123"
def insert_goal(user_id, data): return "goal_123"
def get_profile(user_id): return {"name": "Ravi Kumar", "finscore": 75, "personality_type": "The Saver", "streak_days": 10, "income_type": "Freelance"}
def update_personality(user_id, personality): pass
def init_profile_if_not_exists(user_id): pass
def init_indices(): pass
