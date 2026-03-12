"""
Elasticsearch client initialization and index management.
Connects to Elastic Cloud Serverless. Falls back gracefully if unavailable.
"""
import os
import time
import logging
from elasticsearch import Elasticsearch
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("fincoach.elastic")

ELASTIC_NODE = os.getenv("ELASTIC_NODE", "")
ELASTIC_PASSWORD = os.getenv("ELASTIC_PASSWORD", "")
ELASTIC_USERNAME = os.getenv("ELASTIC_USERNAME", "elastic")  # Default elastic username

# --- Elasticsearch Client (singleton) ---
es_client = None
try:
    if ELASTIC_NODE and ELASTIC_PASSWORD:
        # Try API key auth first; fall back to basic_auth (username:password)
        # API keys are base64 encoded and contain a colon when decoded,
        # so we detect by checking if it looks like id:api_key format
        if ":" in ELASTIC_PASSWORD:
            # basic_auth mode: ELASTIC_PASSWORD = "username:password"
            parts = ELASTIC_PASSWORD.split(":", 1)
            es_client = Elasticsearch(
                hosts=[ELASTIC_NODE],
                basic_auth=(parts[0], parts[1]),
                request_timeout=30,
                meta_header=True  # Enables X-Elastic-Client-Meta for traceability
            )
            logger.info(f"ES client using basic_auth as '{parts[0]}'")
        else:
            # API key mode
            es_client = Elasticsearch(
                hosts=[ELASTIC_NODE],
                api_key=ELASTIC_PASSWORD,
                request_timeout=30,
                meta_header=True  # Enables X-Elastic-Client-Meta for traceability
            )
            logger.info("ES client using api_key auth")
except Exception as e:
    logger.error(f"Elasticsearch client init failed: {e}")
    es_client = None

# --- Index Mappings ---
TRANSACTION_MAPPINGS = {
    "mappings": {
        "properties": {
            "id": {"type": "keyword"},
            "user_id": {"type": "keyword"},
            "amount": {"type": "float"},
            "type": {"type": "keyword"},
            "category": {"type": "keyword"},
            "description": {"type": "text"},
            "date": {"type": "date", "format": "yyyy-MM-dd"}
        }
    }
}

GOAL_MAPPINGS = {
    "mappings": {
        "properties": {
            "id": {"type": "keyword"},
            "user_id": {"type": "keyword"},
            "name": {"type": "text"},
            "target_amount": {"type": "float"},
            "current_amount": {"type": "float"},
            "deadline": {"type": "date", "format": "yyyy-MM-dd"}
        }
    }
}

PROFILE_MAPPINGS = {
    "mappings": {
        "properties": {
            "user_id": {"type": "keyword"},
            "name": {"type": "text"},
            "income_type": {"type": "keyword"},
            "streak_days": {"type": "integer"},
            "personality_type": {"type": "keyword"},
            "finscore": {"type": "integer"}
        }
    }
}

INDICES = {
    "fincoach_transactions": TRANSACTION_MAPPINGS,
    "fincoach_goals": GOAL_MAPPINGS,
    "fincoach_profile": PROFILE_MAPPINGS,
}

# --- Mock Dashboard Data (fallback if ES is completely down) ---
MOCK_DASHBOARD_DATA = {
    "profile": {
        "name": "Ravi Kumar",
        "finscore": 67,
        "personality_type": "Impulsive Spender",
        "streak_days": 12,
        "income_type": "Freelance"
    },
    "income": 34000,
    "spent": 28500,
    "saved": 5500,
    "savings_rate": 0.16,
    "categories": {
        "Food": 9800,
        "Transport": 3200,
        "Entertainment": 2100,
        "Rent": 12000,
        "Bills": 850,
        "Shopping": 550
    },
    "weekly_trend": {"W1": 4200, "W2": 6800, "W3": 9500, "W4": 8000},
    "goals": [
        {"name": "Emergency Fund", "target_amount": 50000, "current_amount": 40000,
         "deadline": "2026-06-30", "progress_pct": 80},
        {"name": "New Bike", "target_amount": 85000, "current_amount": 10200,
         "deadline": "2026-12-31", "progress_pct": 12},
        {"name": "Goa Trip", "target_amount": 24000, "current_amount": 5100,
         "deadline": "2026-10-15", "progress_pct": 21}
    ],
    "alerts": [
        {"type": "warning", "msg": "🟡 Spending at 84% of income. Tighten up this week.", "code": "HIGH_SPEND"},
        {"type": "warning", "msg": "🟡 Food ₹9800 = 29% of income. Healthy limit: 20%", "code": "FOOD_OVERSPEND"},
        {"type": "info", "msg": "📅 Month-end forecast: ₹1200 remaining", "code": "FORECAST"}
    ],
    "forecast": 1200,
    "weekly_budget": {
        "this_week_budget": 4500,
        "this_week_spent": 3200,
        "remaining_today": 650,
        "daily_safe_limit": 786
    }
}


def test_connection() -> bool:
    """Test Elasticsearch connection with retry logic. Returns True if connected."""
    if not es_client:
        return False
    for attempt in range(3):
        try:
            info = es_client.info()
            logger.info(f"Elasticsearch connected (attempt {attempt + 1})")
            return True
        except Exception as e:
            logger.warning(f"ES connection attempt {attempt + 1} failed: {e}")
            if attempt < 2:
                time.sleep(1)
    logger.error("All Elasticsearch connection attempts failed")
    return False


def init_indices():
    """Create required indices if they don't exist."""
    if not es_client:
        logger.warning("ES client not available — skipping index init")
        return
    for index_name, mappings in INDICES.items():
        try:
            if not es_client.indices.exists(index=index_name):
                es_client.indices.create(index=index_name, body=mappings)
                print(f"  ✅ Created index: {index_name}")
            else:
                print(f"  ℹ️  Index exists: {index_name}")
        except Exception as e:
            logger.error(f"Failed to create index {index_name}: {e}")