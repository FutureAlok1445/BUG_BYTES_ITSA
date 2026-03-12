import os
from dotenv import load_dotenv
from elasticsearch import Elasticsearch

load_dotenv()

ELASTIC_NODE = os.getenv("ELASTIC_NODE")
ELASTIC_PASSWORD = os.getenv("ELASTIC_PASSWORD")

es_client = None
try:
    if ELASTIC_NODE and ELASTIC_PASSWORD:
        es_client = Elasticsearch(
            hosts=[ELASTIC_NODE],
            api_key=ELASTIC_PASSWORD
        )
except ValueError as e:
    print(f"Warning: Elasticsearch client init failed - {e}")


def init_indices() -> None:
    try:
        if not es_client:
            print("Elasticsearch client not initialized. Cannot create indices.")
            return

        # Transactions index
        if not es_client.indices.exists(index="fincoach_transactions"):
            es_client.indices.create(
                index="fincoach_transactions",
                body={
                    "mappings": {
                        "properties": {
                            "id": {"type": "keyword"},
                            "user_id": {"type": "keyword"},
                            "amount": {"type": "float"},
                            "type": {"type": "keyword"},
                            "category": {"type": "keyword"},
                            "description": {"type": "text"},
                            "date": {"type": "date"}
                        }
                    }
                }
            )
            print("Created index: fincoach_transactions")
            
        # Goals index
        if not es_client.indices.exists(index="fincoach_goals"):
            es_client.indices.create(
                index="fincoach_goals",
                body={
                    "mappings": {
                        "properties": {
                            "id": {"type": "keyword"},
                            "user_id": {"type": "keyword"},
                            "name": {"type": "text"},
                            "target_amount": {"type": "float"},
                            "current_amount": {"type": "float"},
                            "deadline": {"type": "date"}
                        }
                    }
                }
            )
            print("Created index: fincoach_goals")
            
        # Profile index
        if not es_client.indices.exists(index="fincoach_profile"):
            es_client.indices.create(
                index="fincoach_profile",
                body={
                    "mappings": {
                        "properties": {
                            "user_id": {"type": "keyword"},
                            "name": {"type": "keyword"},
                            "income_type": {"type": "keyword"},
                            "streak_days": {"type": "integer"},
                            "personality_type": {"type": "keyword"}
                        }
                    }
                }
            )
            print("Created index: fincoach_profile")
    except Exception as e:
        print(f"Error initializing indices: {e}")

if __name__ == "__main__":
    init_indices()