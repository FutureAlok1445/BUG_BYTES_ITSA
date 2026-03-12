from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import insert_transaction
from typing import Optional

router = APIRouter()

class TransactionCreate(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None
    date: Optional[str] = None

@router.post("/transactions")
def add_transaction(data: TransactionCreate):
    print("POST /api/transactions hit")
    user_id = "user_001"
    try:
        doc_id = insert_transaction(user_id, data.model_dump() if hasattr(data, 'model_dump') else data.dict())
        return {"status": "ok", "id": doc_id}
    except Exception as e:
        print(f"Error in add_transaction: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while inserting transaction")
