from fastapi import APIRouter

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/")
def get_dashboard() -> dict:
    return {"status": "ok", "data": "Dashboard data"}
