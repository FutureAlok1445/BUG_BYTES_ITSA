from pydantic import BaseModel
from typing import Optional

class Transaction(BaseModel):
    id: Optional[str] = None
    amount: float
    description: str
