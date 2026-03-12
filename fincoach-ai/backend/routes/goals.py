from fastapi import APIRouter
from models.goal import GoalCreate

router = APIRouter(prefix="/goals", tags=["Goals"])

@router.post("/")
def add_goal(goal: GoalCreate) -> dict:
    return {"status": "created"}
