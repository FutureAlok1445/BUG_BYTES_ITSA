from fastapi import APIRouter

router = APIRouter(prefix="/insights", tags=["Insights"])

@router.get("/")
def get_insights() -> dict:
    return {"status": "ok", "data": "Insights data"}
