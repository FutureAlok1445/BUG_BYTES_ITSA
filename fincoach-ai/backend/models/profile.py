from pydantic import BaseModel
from typing import Optional

class UserProfile(BaseModel):
    user_id: str
    name: str
    income_type: str
    streak_days: int
    personality_type: str
    finscore: Optional[int] = None