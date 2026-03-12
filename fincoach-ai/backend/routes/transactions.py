from fastapi import APIRouter
from models.transaction import TransactionCreate

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/")
def add_transaction(transaction: TransactionCreate) -> dict:
    return {"status": "created"}
