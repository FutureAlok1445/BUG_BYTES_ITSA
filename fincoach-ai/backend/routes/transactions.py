from fastapi import APIRouter
from models.transaction import Transaction

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/")
def add_transaction(transaction: Transaction) -> dict:
    return {"status": "created"}
