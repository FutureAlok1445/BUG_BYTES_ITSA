from pydantic import BaseModel
from typing import Optional

class GoalCreate(BaseModel):
    name: str
    target_amount: float
    current_amount: float
    deadline: str

class GoalResponse(GoalCreate):
    id: str
    user_id: str