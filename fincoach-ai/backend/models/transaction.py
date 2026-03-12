"""
Pydantic models for transaction data validation.
"""
from pydantic import BaseModel, field_validator
from typing import Optional, Literal

CATEGORIES = [
    "Food", "Transport", "Entertainment", "Rent", "Bills",
    "Shopping", "Health", "Education", "Freelance", "Salary",
    "Investment", "Recharge", "Other"
]


class TransactionCreate(BaseModel):
    """Model for creating a new transaction."""
    amount: float
    type: Literal["income", "expense"]
    category: str
    description: Optional[str] = ""
    date: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v):
        """Amount must be > 0 and < 1 crore."""
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        if v > 10_000_000:
            raise ValueError("Amount cannot exceed ₹1,00,00,000")
        return round(v, 2)

    @field_validator("category")
    @classmethod
    def category_must_be_valid(cls, v):
        """Category must be in the allowed list."""
        if v not in CATEGORIES:
            raise ValueError(f"Category must be one of: {', '.join(CATEGORIES)}")
        return v

    @field_validator("description")
    @classmethod
    def sanitize_description(cls, v):
        """Enforce max length on description."""
        if v and len(v) > 200:
            return v[:200]
        return v


class TransactionResponse(BaseModel):
    """Model for transaction response."""
    id: str
    user_id: str
    amount: float
    type: str
    category: str
    description: str = ""
    date: str = ""