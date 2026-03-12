"""
Seed data script — populates Elasticsearch with realistic demo data for Ravi Kumar.
Clears old data first, then seeds fresh.
"""
import os
import sys
import uuid
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from db.elastic_client import es_client, init_indices

# --- Indices ---
TX_INDEX = "fincoach_transactions"
GOALS_INDEX = "fincoach_goals"
PROFILE_INDEX = "fincoach_profile"
USER_ID = "user_001"


def clear_data():
    """Delete all existing indices for a clean start."""
    if not es_client:
        print("❌ Cannot clear data — ES client not available")
        return False
    for idx in [TX_INDEX, GOALS_INDEX, PROFILE_INDEX]:
        try:
            if es_client.indices.exists(index=idx):
                es_client.indices.delete(index=idx)
                print(f"  🗑️  Deleted index: {idx}")
        except Exception as e:
            print(f"  ⚠️  Failed to delete {idx}: {e}")
    return True


def seed_profile():
    """Seed Ravi Kumar's user profile."""
    profile = {
        "user_id": USER_ID,
        "name": "Ravi Kumar",
        "income_type": "Freelance",
        "streak_days": 12,
        "personality_type": "Impulsive Spender",
        "finscore": 0
    }
    try:
        es_client.index(index=PROFILE_INDEX, id=USER_ID, document=profile)
        print("✅ Profile created for user_001")
    except Exception as e:
        print(f"❌ Profile seed failed: {e}")


def seed_goals():
    """Seed 3 savings goals for Ravi."""
    goals = [
        {"name": "Emergency Fund", "target_amount": 50000,
         "current_amount": 40000, "deadline": "2026-06-30"},
        {"name": "New Bike", "target_amount": 85000,
         "current_amount": 10200, "deadline": "2026-12-31"},
        {"name": "Goa Trip", "target_amount": 24000,
         "current_amount": 5100, "deadline": "2026-10-15"},
    ]
    for g in goals:
        try:
            doc_id = str(uuid.uuid4())
            g["id"] = doc_id
            g["user_id"] = USER_ID
            es_client.index(index=GOALS_INDEX, id=doc_id, document=g)
            print(f"✅ Inserted goal: {g['name']}")
        except Exception as e:
            print(f"❌ Goal seed failed ({g['name']}): {e}")


def seed_transactions():
    """Seed 28 realistic transactions for Ravi Kumar."""
    now = datetime.now()

    transactions = [
        # ---- 2 Income entries = ₹34,000 ----
        {"amount": 20000, "type": "income", "category": "Freelance",
         "description": "Website project payment", "days_ago": 28},
        {"amount": 14000, "type": "income", "category": "Freelance",
         "description": "Mobile app freelance", "days_ago": 13},

        # ---- Food: 14 entries ~₹9,800 ----
        {"amount": 250, "type": "expense", "category": "Food", "description": "Lunch - canteen", "days_ago": 27},
        {"amount": 180, "type": "expense", "category": "Food", "description": "Tea and snacks", "days_ago": 25},
        {"amount": 1200, "type": "expense", "category": "Food", "description": "Zomato weekend order", "days_ago": 24},
        {"amount": 350, "type": "expense", "category": "Food", "description": "Groceries", "days_ago": 22},
        {"amount": 200, "type": "expense", "category": "Food", "description": "Street food", "days_ago": 20},
        {"amount": 1500, "type": "expense", "category": "Food", "description": "Swiggy weekend binge", "days_ago": 17},
        {"amount": 300, "type": "expense", "category": "Food", "description": "Chai and samosa", "days_ago": 15},
        {"amount": 450, "type": "expense", "category": "Food", "description": "Lunch with friends", "days_ago": 13},
        {"amount": 1800, "type": "expense", "category": "Food", "description": "Saturday dinner out", "days_ago": 10},
        {"amount": 280, "type": "expense", "category": "Food", "description": "Breakfast", "days_ago": 8},
        {"amount": 350, "type": "expense", "category": "Food", "description": "Groceries", "days_ago": 6},
        {"amount": 1200, "type": "expense", "category": "Food", "description": "Sunday Zomato order", "days_ago": 3},
        {"amount": 340, "type": "expense", "category": "Food", "description": "Canteen lunch", "days_ago": 2},
        {"amount": 1400, "type": "expense", "category": "Food", "description": "Weekend dinner", "days_ago": 1},

        # ---- Transport: 6 entries ~₹3,200 ----
        {"amount": 500, "type": "expense", "category": "Transport", "description": "Ola ride", "days_ago": 26},
        {"amount": 600, "type": "expense", "category": "Transport", "description": "Petrol", "days_ago": 21},
        {"amount": 450, "type": "expense", "category": "Transport", "description": "Metro pass", "days_ago": 18},
        {"amount": 550, "type": "expense", "category": "Transport", "description": "Uber to client", "days_ago": 14},
        {"amount": 500, "type": "expense", "category": "Transport", "description": "Petrol refill", "days_ago": 7},
        {"amount": 600, "type": "expense", "category": "Transport", "description": "Ola rides", "days_ago": 4},

        # ---- Entertainment: 4 entries ~₹2,100 ----
        {"amount": 600, "type": "expense", "category": "Entertainment", "description": "Movie tickets", "days_ago": 23},
        {"amount": 500, "type": "expense", "category": "Entertainment", "description": "Netflix subscription", "days_ago": 16},
        {"amount": 400, "type": "expense", "category": "Entertainment", "description": "Gaming purchase", "days_ago": 9},
        {"amount": 600, "type": "expense", "category": "Entertainment", "description": "Concert tickets", "days_ago": 5},

        # ---- Rent: 1 entry ₹12,000 ----
        {"amount": 12000, "type": "expense", "category": "Rent", "description": "Monthly rent", "days_ago": 28},

        # ---- Bills: 2 entries ~₹850 ----
        {"amount": 500, "type": "expense", "category": "Bills", "description": "Electricity bill", "days_ago": 19},
        {"amount": 350, "type": "expense", "category": "Bills", "description": "Mobile recharge", "days_ago": 11},
    ]

    success = 0
    for tx in transactions:
        try:
            doc_id = str(uuid.uuid4())
            date = (now - timedelta(days=tx.pop("days_ago"))).strftime("%Y-%m-%d")
            doc = {
                "id": doc_id,
                "user_id": USER_ID,
                "amount": tx["amount"],
                "type": tx["type"],
                "category": tx["category"],
                "description": tx["description"],
                "date": date
            }
            es_client.index(index=TX_INDEX, id=doc_id, document=doc)
            success += 1
        except Exception as e:
            print(f"  ❌ Transaction failed: {e}")

    # Totals check
    income_total = sum(t["amount"] for t in transactions if t.get("type") == "income")
    expense_total = sum(t["amount"] for t in transactions if t.get("type") == "expense")
    print(f"✅ Inserted {success}/{len(transactions)} transactions")
    print(f"   Income: ₹{income_total:,} | Expenses: ₹{expense_total:,}")


def main():
    """Run the complete seed process."""
    print("\n" + "=" * 50)
    print("🌱 FinCoach AI — Database Seeder")
    print("=" * 50)

    if not es_client:
        print("❌ Elasticsearch client not available.")
        print("   Please set ELASTIC_NODE and ELASTIC_PASSWORD in .env")
        sys.exit(1)

    print("\n1️⃣  Clearing old data...")
    clear_data()

    print("\n2️⃣  Initializing indices...")
    init_indices()

    print("\n3️⃣  Seeding Profile...")
    seed_profile()

    print("\n4️⃣  Seeding Goals...")
    seed_goals()

    print("\n5️⃣  Seeding Transactions...")
    seed_transactions()

    print("\n" + "=" * 50)
    print("✅ Seed complete! 3 goals, 1 profile, 28 transactions.")
    print("=" * 50 + "\n")


if __name__ == "__main__":
    main()