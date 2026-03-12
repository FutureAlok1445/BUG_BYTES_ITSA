"""
Input validation and sanitization for all incoming data.
Prevents XSS, injection attacks, and enforces data integrity.
"""
import re
from datetime import datetime, timedelta

# Allowed transaction categories
ALLOWED_CATEGORIES = [
    "Food", "Transport", "Entertainment", "Rent", "Bills",
    "Shopping", "Health", "Education", "Freelance", "Salary",
    "Investment", "Recharge", "Other"
]

# Prompt injection patterns to block
INJECTION_PATTERNS = [
    r"ignore\s+(previous|above|all)",
    r"system\s*:",
    r"assistant\s*:",
    r"forget\s+(everything|all|previous)",
    r"new\s+instructions",
    r"pretend\s+(you\s+are|to\s+be)",
    r"you\s+are\s+now",
    r"disregard",
    r"override",
    r"jailbreak",
]


def sanitize_text(text: str, max_length: int = 200) -> str:
    """Strip HTML tags, injection patterns, and enforce max length."""
    if not text:
        return ""
    # Strip HTML tags
    cleaned = re.sub(r"<[^>]*>", "", text)
    # Remove script-related content
    cleaned = re.sub(r"(?i)(javascript|on\w+\s*=|<script)", "", cleaned)
    # Strip leading/trailing whitespace
    cleaned = cleaned.strip()
    # Enforce max length
    return cleaned[:max_length]


def validate_amount(amount: float) -> float:
    """Validate transaction amount: must be > 0 and < 1 crore."""
    if amount <= 0:
        raise ValueError("Amount must be greater than 0")
    if amount > 10_000_000:
        raise ValueError("Amount cannot exceed ₹1,00,00,000")
    return round(amount, 2)


def validate_date(date_str: str, allow_future: bool = False) -> str:
    """Validate date format (YYYY-MM-DD), not in future (for expenses), not older than 2 years."""
    try:
        parsed = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        raise ValueError("Date must be in YYYY-MM-DD format")

    now = datetime.now()
    if not allow_future and parsed.date() > now.date():
        raise ValueError("Date cannot be in the future for expenses")
    if parsed.date() < (now - timedelta(days=730)).date():
        raise ValueError("Date cannot be older than 2 years")

    return date_str


def validate_category(category: str) -> str:
    """Validate category is in the allowed list."""
    if category not in ALLOWED_CATEGORIES:
        raise ValueError(f"Category must be one of: {', '.join(ALLOWED_CATEGORIES)}")
    return category


def validate_chat_message(message: str, max_length: int = 500) -> str:
    """Validate and sanitize chat messages, block prompt injection attempts."""
    if not message or not message.strip():
        raise ValueError("Message cannot be empty")

    cleaned = message.strip()

    if len(cleaned) > max_length:
        raise ValueError(f"Message cannot exceed {max_length} characters")

    # Check for prompt injection patterns
    lower = cleaned.lower()
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, lower):
            raise ValueError("Invalid message")

    return sanitize_text(cleaned, max_length)
