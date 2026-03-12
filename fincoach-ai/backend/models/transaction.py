from pydantic import BaseModel
from typing import Optional, Literal

CATEGORIES = ["Food", "Transport", "Entertainment", "Rent", "Bills", "Shopping", "Health", "Other"]

class TransactionCreate(BaseModel):
    amount: float
    type: Literal["income", "expense"]
    category: str
    description: str
    date: str

class TransactionResponse(TransactionCreate):
    id: str
    user_id: str