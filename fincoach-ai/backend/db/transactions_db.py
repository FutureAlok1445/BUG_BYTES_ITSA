from db.elastic_client import es_client
from typing import List, Dict, Any
import uuid
import datetime

INDEX = "fincoach_transactions"

def get_all_transactions(user_id: str) -> List[Dict[str, Any]]:
    try:
        if not es_client or not es_client.indices.exists(index=INDEX):
            return []
        res = es_client.search(
            index=INDEX,
            body={
                "query": {"term": {"user_id": user_id}},
                "sort": [{"date": {"order": "desc"}}],
                "size": 1000
            }
        )
        return [hit["_source"] for hit in res["hits"]["hits"]]
    except Exception as e:
        print(f"Error in get_all_transactions: {e}")
        return []

def insert_transaction(user_id: str, data: Dict[str, Any]) -> str:
    try:
        if not es_client: return ""
        doc_id = str(uuid.uuid4())
        doc = data.copy()
        doc["id"] = doc_id
        doc["user_id"] = user_id
        es_client.index(index=INDEX, id=doc_id, body=doc, refresh=True)
        return doc_id
    except Exception as e:
        print(f"Error in insert_transaction: {e}")
        return ""

def get_transactions_by_category(user_id: str) -> Dict[str, float]:
    try:
        if not es_client or not es_client.indices.exists(index=INDEX):
            return {}
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
                        "terms": {"field": "category", "size": 100},
                        "aggs": {
                            "total_amount": {"sum": {"field": "amount"}}
                        }
                    }
                }
            }
        )
        categories = {}
        for bucket in res["aggregations"]["by_category"]["buckets"]:
            categories[bucket["key"]] = bucket["total_amount"]["value"]
        return categories
    except Exception as e:
        print(f"Error in get_transactions_by_category: {e}")
        return {}

def get_weekly_trend(user_id: str) -> Dict[str, float]:
    try:
        if not es_client or not es_client.indices.exists(index=INDEX):
            return {"W1": 0.0, "W2": 0.0, "W3": 0.0, "W4": 0.0}
        
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
                "size": 1000,
                "sort": [{"date": {"order": "desc"}}]
            }
        )
        
        weeks = {"W1": 0.0, "W2": 0.0, "W3": 0.0, "W4": 0.0}
        hits = res["hits"]["hits"]
        today = datetime.datetime.now().date()
        for hit in hits:
            doc = hit["_source"]
            date_str = doc.get("date")
            if not date_str: continue
            try:
                date_obj = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
                delta = (today - date_obj).days
                if delta <= 7:
                    weeks["W4"] += doc["amount"]
                elif delta <= 14:
                    weeks["W3"] += doc["amount"]
                elif delta <= 21:
                    weeks["W2"] += doc["amount"]
                else:
                    weeks["W1"] += doc["amount"]
            except Exception:
                pass
        return weeks
    except Exception as e:
        print(f"Error in get_weekly_trend: {e}")
        return {"W1": 0.0, "W2": 0.0, "W3": 0.0, "W4": 0.0}

def get_monthly_totals(user_id: str) -> Dict[str, float]:
    try:
        if not es_client or not es_client.indices.exists(index=INDEX):
            return {"income": 0.0, "spent": 0.0}
        res = es_client.search(
            index=INDEX,
            body={
                "query": {"term": {"user_id": user_id}},
                "size": 0,
                "aggs": {
                    "by_type": {
                        "terms": {"field": "type"},
                        "aggs": {
                            "total_amount": {"sum": {"field": "amount"}}
                        }
                    }
                }
            }
        )
        totals = {"income": 0.0, "spent": 0.0}
        for bucket in res["aggregations"]["by_type"]["buckets"]:
            if bucket["key"] == "income":
                totals["income"] = bucket["total_amount"]["value"]
            elif bucket["key"] == "expense":
                totals["spent"] = bucket["total_amount"]["value"]
        return totals
    except Exception as e:
        print(f"Error in get_monthly_totals: {e}")
        return {"income": 0.0, "spent": 0.0}