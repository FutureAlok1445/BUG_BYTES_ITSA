from db.elastic_client import es_client
from typing import List, Dict, Any
import uuid

INDEX = "fincoach_goals"

def get_all_goals(user_id: str) -> List[Dict[str, Any]]:
    try:
        if not es_client or not es_client.indices.exists(index=INDEX):
            return []
        res = es_client.search(
            index=INDEX,
            body={
                "query": {"term": {"user_id": user_id}},
                "size": 100
            }
        )
        return [hit["_source"] for hit in res["hits"]["hits"]]
    except Exception as e:
        print(f"Error in get_all_goals: {e}")
        return []

def insert_goal(user_id: str, data: Dict[str, Any]) -> str:
    try:
        if not es_client: return ""
        doc_id = str(uuid.uuid4())
        doc = data.copy()
        doc["id"] = doc_id
        doc["user_id"] = user_id
        doc["current_amount"] = doc.get("current_amount", 0.0)
        es_client.index(index=INDEX, id=doc_id, body=doc, refresh=True)
        return doc_id
    except Exception as e:
        print(f"Error in insert_goal: {e}")
        return ""

def update_goal_progress(user_id: str, goal_id: str, new_amount: float) -> bool:
    try:
        if not es_client: return False
        es_client.update(
            index=INDEX,
            id=goal_id,
            body={"doc": {"current_amount": new_amount}},
            refresh=True
        )
        return True
    except Exception as e:
        print(f"Error in update_goal_progress: {e}")
        return False
