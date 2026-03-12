"""
Goals route — CRUD for savings goals with validation.
"""
from fastapi import APIRouter, Request, HTTPException
from models.goal import GoalCreate
from db import get_all_goals, insert_goal
from security.input_validator import sanitize_text, validate_amount, validate_date
from security.rate_limiter import limiter, DEFAULT_LIMIT

router = APIRouter()


@router.post("/goals")
@limiter.limit(DEFAULT_LIMIT)
def add_goal(data: GoalCreate, request: Request):
    """Add a new savings goal."""
    user_id = "user_001"
    try:
        validated = data.model_dump()
        validated["name"] = sanitize_text(validated["name"], max_length=100)
        validated["target_amount"] = validate_amount(validated["target_amount"])

        if validated.get("deadline"):
            validated["deadline"] = validate_date(validated["deadline"], allow_future=True)

        doc_id = insert_goal(user_id, validated)
        if not doc_id:
            raise HTTPException(status_code=503, detail="Database unavailable. Please retry.")

        return {"status": "ok", "id": doc_id}

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        print(f"Goal error: {e}")
        raise HTTPException(status_code=500, detail="Failed to add goal")


@router.get("/goals")
@limiter.limit(DEFAULT_LIMIT)
def fetch_goals(request: Request):
    """Get all goals with progress_pct calculated."""
    user_id = "user_001"
    try:
        goals = get_all_goals(user_id)
        # Add progress_pct to each goal
        for g in goals:
            target = g.get("target_amount", 1)
            current = g.get("current_amount", 0)
            g["progress_pct"] = round((current / target * 100) if target > 0 else 0)
        return goals
    except Exception as e:
        print(f"Fetch goals error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch goals")
