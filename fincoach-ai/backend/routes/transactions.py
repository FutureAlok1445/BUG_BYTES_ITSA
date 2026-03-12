"""
Transactions route — CRUD for financial transactions with input validation.
"""
from datetime import datetime
from fastapi import APIRouter, Request, HTTPException
from models.transaction import TransactionCreate
from db import insert_transaction, get_all_transactions
from security.input_validator import sanitize_text, validate_amount, validate_date, validate_category
from security.rate_limiter import limiter, TRANSACTIONS_LIMIT, DEFAULT_LIMIT

router = APIRouter()


@router.post("/transactions")
@limiter.limit(TRANSACTIONS_LIMIT)
def add_transaction(data: TransactionCreate, request: Request):
    """Add a new transaction. Rate limited: 20/min."""
    user_id = "user_001"
    try:
        # Additional server-side validation
        validated = data.model_dump()
        validated["description"] = sanitize_text(validated.get("description", ""))
        validated["amount"] = validate_amount(validated["amount"])
        validated["category"] = validate_category(validated["category"])

        if validated.get("date"):
            allow_future = (validated.get("type") == "income")
            validated["date"] = validate_date(validated["date"], allow_future=allow_future)
        else:
            validated["date"] = datetime.now().strftime("%Y-%m-%d")

        doc_id = insert_transaction(user_id, validated)
        if not doc_id:
            raise HTTPException(status_code=503, detail="Database unavailable. Please retry.")

        return {"status": "ok", "id": doc_id}

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        print(f"Transaction error: {e}")
        raise HTTPException(status_code=500, detail="Failed to add transaction")


@router.get("/transactions")
@limiter.limit(DEFAULT_LIMIT)
def fetch_transactions(request: Request):
    """Get last 50 transactions, sorted by date desc."""
    user_id = "user_001"
    try:
        txns = get_all_transactions(user_id, limit=50)
        return txns
    except Exception as e:
        print(f"Fetch transactions error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch transactions")
