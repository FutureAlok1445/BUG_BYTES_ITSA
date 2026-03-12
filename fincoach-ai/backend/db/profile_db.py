"""
User profile database operations against Elasticsearch.
Every function has try/except and returns safe fallback values.
"""
import logging
from typing import Dict, Any, Optional
from db.elastic_client import es_client

logger = logging.getLogger("fincoach.profile_db")
INDEX = "fincoach_profile"

FALLBACK_PROFILE = {
    "user_id": "user_001",
    "name": "Ravi Kumar",
    "income_type": "Freelance",
    "streak_days": 12,
    "personality_type": "Impulsive Spender",
    "finscore": 67
}


def get_profile(user_id: str) -> Dict[str, Any]:
    """Fetch user profile by user_id."""
    try:
        if not es_client or not es_client.indices.exists(index=INDEX):
            return FALLBACK_PROFILE
        res = es_client.search(
            index=INDEX,
            body={"query": {"term": {"user_id": user_id}}, "size": 1}
        )
        if res["hits"]["hits"]:
            return res["hits"]["hits"][0]["_source"]
        return FALLBACK_PROFILE
    except Exception as e:
        logger.error(f"get_profile failed: {e}")
        return FALLBACK_PROFILE


def update_personality(user_id: str, personality: str) -> bool:
    """Update user's personality type."""
    try:
        if not es_client or not es_client.indices.exists(index=INDEX):
            return False
        res = es_client.search(
            index=INDEX,
            body={"query": {"term": {"user_id": user_id}}, "size": 1}
        )
        if res["hits"]["hits"]:
            doc_id = res["hits"]["hits"][0]["_id"]
            es_client.update(index=INDEX, id=doc_id, body={"doc": {"personality_type": personality}})
            return True
        return False
    except Exception as e:
        logger.error(f"update_personality failed: {e}")
        return False


def increment_streak(user_id: str) -> bool:
    """Increment the user's saving streak by 1 day."""
    try:
        if not es_client or not es_client.indices.exists(index=INDEX):
            return False
        res = es_client.search(
            index=INDEX,
            body={"query": {"term": {"user_id": user_id}}, "size": 1}
        )
        if res["hits"]["hits"]:
            doc_id = res["hits"]["hits"][0]["_id"]
            current = res["hits"]["hits"][0]["_source"].get("streak_days", 0)
            es_client.update(index=INDEX, id=doc_id, body={"doc": {"streak_days": current + 1}})
            return True
        return False
    except Exception as e:
        logger.error(f"increment_streak failed: {e}")
        return False


def init_profile_if_not_exists(user_id: str) -> bool:
    """Create a default profile for user if one doesn't exist."""
    try:
        if not es_client:
            return False
        try:
            if not es_client.indices.exists(index=INDEX):
                return False
        except Exception:
            return False

        res = es_client.search(
            index=INDEX,
            body={"query": {"term": {"user_id": user_id}}, "size": 1}
        )
        if res["hits"]["hits"]:
            return True

        default_profile = {
            "user_id": user_id,
            "name": "Ravi Kumar",
            "income_type": "Freelance",
            "streak_days": 12,
            "personality_type": "Impulsive Spender",
            "finscore": 0
        }
        es_client.index(index=INDEX, id=user_id, document=default_profile)
        print(f"  ✅ Created default profile for {user_id}")
        return True
    except Exception as e:
        logger.error(f"init_profile_if_not_exists failed: {e}")
        return False