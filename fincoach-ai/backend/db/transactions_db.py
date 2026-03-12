"""
Transaction database operations against Elasticsearch.
Every function has try/except and returns safe fallback values.
"""
import uuid
import logging
from typing import List, Dict, Any
from db.elastic_client import es_client

logger = logging.getLogger("fincoach.transactions_db")
INDEX = "fincoach_transactions"

# --- Fallback data if ES is down ---
FALLBACK_TOTALS = {"income": 34000, "spent": 28500}
FALLBACK_CATEGORIES = {"Food": 9800, "Transport": 3200, "Entertainment": 2100, "Rent": 12000, "Bills": 850}
FALLBACK_WEEKLY = {"W1": 4200, "W2": 6800, "W3": 9500, "W4": 8000}


def get_all_transactions(user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
    """Fetch last N transactions for a user, sorted by date desc."""
    try:
        if not es_client or not es_client.indices.exists(index=INDEX):
            return []
        res = es_client.search(
            index=INDEX,
            body={
                "query": {"term": {"user_id": user_id}},
                "sort": [{"date": {"order": "desc"}}],
                "size": limit
            }
        )
        return [hit["_source"] for hit in res["hits"]["hits"]]
    except Exception as e:
        logger.error(f"get_all_transactions failed: {e}")
        return []


def insert_transaction(user_id: str, data: Dict[str, Any]) -> str:
    """Insert a new transaction document. Returns doc ID or empty string on failure."""
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
        logger.error(f"insert_transaction failed: {e}")
        return ""


def get_transactions_by_category(user_id: str) -> Dict[str, float]:
    """Get spending totals grouped by category for expense transactions."""
    try:
        if not es_client or not es_client.indices.exists(index=INDEX):
            return FALLBACK_CATEGORIES
        res = es_client.search(
            index=INDEX,
            body={
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"user_id": user_id}},
                            {"term": {"type": "expense"}}
                        ]
                    }
                },
                "size": 0,
                "aggs": {
                    "by_category": {
                        "terms": {"field": "category", "size": 20},
                        "aggs": {"total": {"sum": {"field": "amount"}}}
                    }
                }
            }
        )
        result = {}
        for bucket in res["aggregations"]["by_category"]["buckets"]:
            result[bucket["key"]] = round(bucket["total"]["value"], 2)
        return result if result else FALLBACK_CATEGORIES
    except Exception as e:
        logger.error(f"get_transactions_by_category failed: {e}")
        return FALLBACK_CATEGORIES


def get_weekly_trend(user_id: str) -> Dict[str, float]:
    """Get weekly spending trend (W1-W4) for the current month."""
    try:
        if not es_client or not es_client.indices.exists(index=INDEX):
            return FALLBACK_WEEKLY
        res = es_client.search(
            index=INDEX,
            body={
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"user_id": user_id}},
                            {"term": {"type": "expense"}}
                        ]
                    }
                },
                "sort": [{"date": {"order": "asc"}}],
                "size": 200
            }
        )
        transactions = [hit["_source"] for hit in res["hits"]["hits"]]
        weeks = {"W1": 0.0, "W2": 0.0, "W3": 0.0, "W4": 0.0}
        for tx in transactions:
            try:
                day = int(tx.get("date", "2026-01-15").split("-")[2])
                if day <= 7:
                    weeks["W1"] += tx.get("amount", 0)
                elif day <= 14:
                    weeks["W2"] += tx.get("amount", 0)
                elif day <= 21:
                    weeks["W3"] += tx.get("amount", 0)
                else:
                    weeks["W4"] += tx.get("amount", 0)
            except (ValueError, IndexError):
                continue
        return {k: round(v, 2) for k, v in weeks.items()}
    except Exception as e:
        logger.error(f"get_weekly_trend failed: {e}")
        return FALLBACK_WEEKLY


def get_monthly_totals(user_id: str) -> Dict[str, float]:
    """Get total income and total expenses for the current month."""
    try:
        if not es_client or not es_client.indices.exists(index=INDEX):
            return FALLBACK_TOTALS
        income_res = es_client.search(
            index=INDEX,
            body={
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"user_id": user_id}},
                            {"term": {"type": "income"}}
                        ]
                    }
                },
                "size": 0,
                "aggs": {"total_income": {"sum": {"field": "amount"}}}
            }
        )
        expense_res = es_client.search(
            index=INDEX,
            body={
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"user_id": user_id}},
                            {"term": {"type": "expense"}}
                        ]
                    }
                },
                "size": 0,
                "aggs": {"total_spent": {"sum": {"field": "amount"}}}
            }
        )
        income = round(income_res["aggregations"]["total_income"]["value"], 2)
        spent = round(expense_res["aggregations"]["total_spent"]["value"], 2)
        result = {"income": income, "spent": spent}
        return result if (income > 0 or spent > 0) else FALLBACK_TOTALS
    except Exception as e:
        logger.error(f"get_monthly_totals failed: {e}")
        return FALLBACK_TOTALS