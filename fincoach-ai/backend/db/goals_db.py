"""
Goals database operations against Elasticsearch.
Every function has try/except and returns safe fallback values.
"""
import uuid
import logging
from typing import List, Dict, Any
from db.elastic_client import es_client

logger = logging.getLogger("fincoach.goals_db")
INDEX = "fincoach_goals"

FALLBACK_GOALS = [
    {"name": "Emergency Fund", "target_amount": 50000, "current_amount": 40000, "deadline": "2026-06-30"},
    {"name": "New Bike", "target_amount": 85000, "current_amount": 10200, "deadline": "2026-12-31"},
    {"name": "Goa Trip", "target_amount": 24000, "current_amount": 5100, "deadline": "2026-10-15"}
]


def get_all_goals(user_id: str) -> List[Dict[str, Any]]:
    """Fetch all goals for a user."""
    try:
        if not es_client or not es_client.indices.exists(index=INDEX):
            return FALLBACK_GOALS
        res = es_client.search(
            index=INDEX,
            body={"query": {"term": {"user_id": user_id}}, "size": 50}
        )
        goals = [hit["_source"] for hit in res["hits"]["hits"]]
        return goals if goals else FALLBACK_GOALS
    except Exception as e:
        logger.error(f"get_all_goals failed: {e}")
        return FALLBACK_GOALS


def insert_goal(user_id: str, data: Dict[str, Any]) -> str:
    """Insert a new goal. Returns doc ID or empty string on failure."""
    try:
        if not es_client:
            return ""
        doc_id = str(uuid.uuid4())
        doc = data.copy()
        doc["id"] = doc_id
        doc["user_id"] = user_id
        es_client.index(index=INDEX, id=doc_id, document=doc)
        return doc_id
    except Exception as e:
        logger.error(f"insert_goal failed: {e}")
        return ""


def update_goal_progress(user_id: str, goal_id: str, new_amount: float) -> bool:
    """Update a goal's current_amount. Returns True on success."""
    try:
        if not es_client:
            return False
        es_client.update(
            index=INDEX,
            id=goal_id,
            body={"doc": {"current_amount": new_amount}}
        )
        return True
    except Exception as e:
        logger.error(f"update_goal_progress failed: {e}")
        return False
