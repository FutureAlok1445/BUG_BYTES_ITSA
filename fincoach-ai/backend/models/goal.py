"""
Pydantic models for goal data validation.
"""
from pydantic import BaseModel, field_validator
from typing import Optional


class GoalCreate(BaseModel):
    """Model for creating a new savings goal."""
    name: str
    target_amount: float
    current_amount: Optional[float] = 0.0
    deadline: str

    @field_validator("name")
    @classmethod
    def name_must_be_valid(cls, v):
        """Name must be non-empty and under 100 characters."""
        if not v or not v.strip():
            raise ValueError("Goal name cannot be empty")
        if len(v) > 100:
            return v[:100]
        return v.strip()

    @field_validator("target_amount")
    @classmethod
    def target_must_be_positive(cls, v):
        """Target amount must be > 0."""
        if v <= 0:
            raise ValueError("Target amount must be greater than 0")
        return round(v, 2)

    @field_validator("current_amount")
    @classmethod
    def current_must_be_valid(cls, v):
        """Current amount must be >= 0."""
        if v is not None and v < 0:
            raise ValueError("Current amount cannot be negative")
        return round(v or 0, 2)


class GoalResponse(BaseModel):
    """Model for goal response."""
    id: str = ""
    user_id: str = ""
    name: str
    target_amount: float
    current_amount: float = 0.0
    deadline: str = ""
    progress_pct: float = 0.0