from pydantic import BaseModel
from typing import Optional

class Profile(BaseModel):
    id: Optional[str] = None
    name: str
    score: int
