import os
import sys
import datetime
import random
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.elastic_client import es_client, init_indices
from db.transactions_db import insert_transaction
from db.goals_db import insert_goal
from db.profile_db import init_profile_if_not_exists

def run_seed():
    print("Initializing indices...")
    try:
        es_client.indices.delete(index="fincoach_transactions", ignore_unavailable=True)
        es_client.indices.delete(index="fincoach_goals", ignore_unavailable=True)
        es_client.indices.delete(index="fincoach_profile", ignore_unavailable=True)
    except Exception:
        pass
        
    init_indices()
    
    user_id = "user_001"
    
    # 1. Profile
    print("\nSeeding Profile...")
    init_profile_if_not_exists(user_id)
    
    # 2. Goals
    print("\nSeeding Goals...")
    goals = [
        {"name": "Emergency Fund", "target_amount": 20000.0, "current_amount": 16000.0, "deadline": "2026-12-31"},
        {"name": "New Bike", "target_amount": 80000.0, "current_amount": 9600.0, "deadline": "2026-08-31"},
        {"name": "Goa Trip", "target_amount": 15000.0, "current_amount": 3200.0, "deadline": "2026-05-31"}
    ]
    for g in goals:
        insert_goal(user_id, g)
        print(f"✅ Inserted goal: {g['name']}")
        
    # 3. Transactions
    print("\nSeeding Transactions...")
    today = datetime.datetime.now().date()
    
    # 2 income entries: ₹20,000 on 1st, ₹14,000 on 18th
    t1_date = today.replace(day=1)
    if t1_date > today:
        t1_date = t1_date - datetime.timedelta(days=30)
    
    t2_date = t1_date.replace(day=18)
    
    insert_transaction(user_id, {
        "amount": 20000.0, "type": "income", "category": "Other", 
        "description": "Freelance project Payment", "date": t1_date.strftime("%Y-%m-%d")
    })
    insert_transaction(user_id, {
        "amount": 14000.0, "type": "income", "category": "Other", 
        "description": "Website retainer", "date": t2_date.strftime("%Y-%m-%d")
    })
    
    # Rent: 1 transaction ₹12,000
    insert_transaction(user_id, {
        "amount": 12000.0, "type": "expense", "category": "Rent", 
        "description": "House Rent", "date": t1_date.replace(day=5).strftime("%Y-%m-%d")
    })
    
    # Bills: 2 transactions ~₹850
    insert_transaction(user_id, {
        "amount": 350.0, "type": "expense", "category": "Bills", 
        "description": "Mobile Recharge", "date": t1_date.replace(day=2).strftime("%Y-%m-%d")
    })
    insert_transaction(user_id, {
        "amount": 500.0, "type": "expense", "category": "Bills", 
        "description": "Electricity", "date": t1_date.replace(day=10).strftime("%Y-%m-%d")
    })
    
    # Entertainment: 4 transactions totaling ~₹2,100 (Netflix ₹199, Spotify ₹149, movie ₹850, cricket ₹900)
    insert_transaction(user_id, {
        "amount": 199.0, "type": "expense", "category": "Entertainment", 
        "description": "Netflix", "date": t1_date.replace(day=3).strftime("%Y-%m-%d")
    })
    insert_transaction(user_id, {
        "amount": 149.0, "type": "expense", "category": "Entertainment", 
        "description": "Spotify", "date": t1_date.replace(day=4).strftime("%Y-%m-%d")
    })
    insert_transaction(user_id, {
        "amount": 850.0, "type": "expense", "category": "Entertainment", 
        "description": "Movie tickets", "date": t1_date.replace(day=14).strftime("%Y-%m-%d")
    })
    insert_transaction(user_id, {
        "amount": 900.0, "type": "expense", "category": "Entertainment", 
        "description": "Cricket Match", "date": t1_date.replace(day=20).strftime("%Y-%m-%d")
    })
    
    # Transport: 6 transactions totaling ~₹3,200 (Uber, petrol)
    transport_amounts = [600, 450, 700, 500, 400, 550]
    for i, amt in enumerate(transport_amounts):
        day = 5 + (i * 4)
        if day > 28: day = 28
        insert_transaction(user_id, {
            "amount": float(amt), "type": "expense", "category": "Transport", 
            "description": "Uber/Petrol", "date": t1_date.replace(day=day).strftime("%Y-%m-%d")
        })
        
    # Food: 12 transactions totaling ~₹9,800 (weekends 3x higher than weekdays)
    food_amounts = [1200, 300, 1500, 250, 1300, 400, 1400, 200, 1800, 350, 800, 300]
    for i, amt in enumerate(food_amounts):
        day = 2 + (i * 2)
        if day > 28: day = 25
        insert_transaction(user_id, {
            "amount": float(amt), "type": "expense", "category": "Food", 
            "description": "Zomato / Swiggy / Dining", "date": t1_date.replace(day=day).strftime("%Y-%m-%d")
        })
        
    # 3 missing transactions to hit exactly 30 count and 28,500 spent
    insert_transaction(user_id, {
        "amount": 300.0, "type": "expense", "category": "Shopping", 
        "description": "Amazon - Shoes", "date": t1_date.replace(day=12).strftime("%Y-%m-%d")
    })
    insert_transaction(user_id, {
        "amount": 150.0, "type": "expense", "category": "Health", 
        "description": "Pharmacy - Meds", "date": t1_date.replace(day=16).strftime("%Y-%m-%d")
    })
    insert_transaction(user_id, {
        "amount": 100.0, "type": "expense", "category": "Other", 
        "description": "Misc", "date": t1_date.replace(day=22).strftime("%Y-%m-%d")
    })
    
    print("\n✅ Seed data generation complete! Populated 3 goals, 1 profile, and 30 transactions.")

if __name__ == '__main__':
    run_seed()