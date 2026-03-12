"""
Pydantic model for user profile.
"""
from pydantic import BaseModel
from typing import Optional


class UserProfile(BaseModel):
    """Model for user profile data."""
    user_id: str = "user_001"
    name: str = "Ravi Kumar"
    income_type: str = "Freelance"
    streak_days: int = 0
    personality_type: str = "Unknown"
    finscore: Optional[int] = 0