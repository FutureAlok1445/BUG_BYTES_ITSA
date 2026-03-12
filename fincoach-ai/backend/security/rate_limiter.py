"""
Rate limiter configuration using slowapi.
Per-endpoint rate limits to protect expensive AI calls.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

# Create limiter instance keyed by client IP
limiter = Limiter(key_func=get_remote_address, default_limits=["30/minute"])

# --- Per-endpoint limit strings ---
CHAT_LIMIT = "10/minute"
INSIGHTS_LIMIT = "5/minute"
REPORTS_LIMIT = "3/minute"
TRANSACTIONS_LIMIT = "20/minute"
DEFAULT_LIMIT = "30/minute"
