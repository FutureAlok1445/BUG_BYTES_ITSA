from db.elastic_client import es_client
from typing import Dict, Any

INDEX   = "fincoach_profile"

def get_profile(user_id: str) -> Dict[str, Any]:
    """Get user profile"""
    try:
        if not es_client or not es_client.indices.exists(index=INDEX):
            # Return default profile as fallback
            return {
                "user_id":          user_id,
                "name":             "Ravi Kumar",
                "income_type":      "irregular",
                "streak_days":      12,
                "personality_type": "Impulsive Spender"
            }
        resp = es_client.get(index=INDEX, id=user_id)
        profile = resp["_source"]
        print(f"✅ get_profile: {profile.get('name')}")
        return profile
    except Exception as e:
        print(f"❌ get_profile error: {e}")
        # Return default profile as fallback
        return {
            "user_id":          user_id,
            "name":             "Ravi Kumar",
            "income_type":      "irregular",
            "streak_days":      12,
            "personality_type": "Impulsive Spender"
        }

def update_personality(user_id: str, personality_type: str) -> bool:
    """Update AI-detected personality type"""
    try:
        if not es_client: return False

        es_client.update(
            index=INDEX,
            id=user_id,
            body={"doc": {"personality_type": personality_type}},
            refresh=True
        )
        print(f"✅ update_personality: {personality_type}")
        return True
    except Exception as e:
        print(f"❌ update_personality error: {e}")
        return False

def increment_streak(user_id: str) -> bool:
    """Increment saving streak by 1"""
    try:
        if not es_client: return False

        es_client.update(
            index=INDEX,
            id=user_id,
            body={"script": {"source": "ctx._source.streak_days += 1"}},
            refresh=True
        )
        print(f"✅ increment_streak done")
        return True
    except Exception as e:
        print(f"❌ increment_streak error: {e}")
        return False

def init_profile_if_not_exists(user_id: str) -> bool:
    """Create default profile for demo user if not exists"""
    try:
        if not es_client: return False
        if not es_client.indices.exists(index=INDEX):
            es_client.indices.create(index=INDEX)
        es_client.get(index=INDEX, id=user_id)
        print(f"ℹ️  Profile already exists for {user_id}")
        return True
    except Exception:
        # Doesn't exist — create it
        es_client.index(
            index=INDEX,
            id=user_id,
            body={
                "user_id":          user_id,
                "name":             "Ravi Kumar",
                "income_type":      "irregular",
                "streak_days":      12,
                "personality_type": "Impulsive Spender"
            },
            refresh=True
        )
        print(f"✅ Profile created for {user_id}")
        return True