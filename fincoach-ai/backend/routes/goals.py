from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import insert_goal, get_all_goals
from typing import Optional

router = APIRouter()

class GoalCreate(BaseModel):
    name: str
    target_amount: float
    current_amount: Optional[float] = 0.0
    deadline: str

@router.post("/goals")
def add_goal(data: GoalCreate):
    print("POST /api/goals hit")
    user_id = "user_001"
    try:
        doc_id = insert_goal(user_id, data.model_dump() if hasattr(data, 'model_dump') else data.dict())
        return {"status": "ok", "id": doc_id}
    except Exception as e:
        print(f"Error in add_goal: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while inserting goal")

@router.get("/goals")
def fetch_goals():
    print("GET /api/goals hit")
    user_id = "user_001"
    try:
        goals = get_all_goals(user_id)
        return goals
    except Exception as e:
        print(f"Error in fetch_goals: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while fetching goals")
