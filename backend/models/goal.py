from pydantic import BaseModel
from typing import Optional

class Goal(BaseModel):
    id: Optional[str] = None
    name: str
    target_amount: float
