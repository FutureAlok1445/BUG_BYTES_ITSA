from fastapi import APIRouter
from models.goal import Goal

router = APIRouter(prefix="/goals", tags=["Goals"])

@router.post("/")
def add_goal(goal: Goal) -> dict:
    return {"status": "created"}
