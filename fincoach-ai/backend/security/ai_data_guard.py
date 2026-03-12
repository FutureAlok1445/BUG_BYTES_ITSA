"""
AI Data Guard — strips PII before sending any data to the Groq API.
This is a CRITICAL security layer to protect user privacy.
"""
import re
import logging

logger = logging.getLogger("fincoach.ai_guard")

# Patterns that might contain PII
PHONE_PATTERN = re.compile(r"\b\d{10,12}\b")
EMAIL_PATTERN = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")
AADHAAR_PATTERN = re.compile(r"\b\d{4}\s?\d{4}\s?\d{4}\b")
PAN_PATTERN = re.compile(r"\b[A-Z]{5}\d{4}[A-Z]\b")


def _get_first_name(full_name: str) -> str:
    """Extract only the first name from a full name."""
    if not full_name:
        return "User"
    return full_name.strip().split()[0]


def _strip_pii_from_text(text: str) -> str:
    """Remove phone numbers, emails, Aadhaar, PAN from text."""
    if not text:
        return text
    cleaned = PHONE_PATTERN.sub("[REDACTED]", text)
    cleaned = EMAIL_PATTERN.sub("[REDACTED]", cleaned)
    cleaned = AADHAAR_PATTERN.sub("[REDACTED]", cleaned)
    cleaned = PAN_PATTERN.sub("[REDACTED]", cleaned)
    return cleaned


def build_safe_ai_context(raw_data: dict) -> dict:
    """
    Build a sanitized context dict safe to send to external AI APIs.
    Strips PII, keeps only aggregated financial patterns.
    Logs a WARNING each time PII is stripped.
    """
    safe = {}

    # Name — first name only
    full_name = raw_data.get("name", "User")
    first_name = _get_first_name(full_name)
    if first_name != full_name:
        logger.warning("AI_GUARD: Stripped full name to first name only")
    safe["name"] = first_name

    # Numerical fields — safe to include directly
    for key in ["finscore", "income", "spent", "saved", "savings_rate",
                "streak", "streak_days", "forecast"]:
        if key in raw_data:
            safe[key] = raw_data[key]

    # Personality — safe to include
    if "personality" in raw_data:
        safe["personality"] = raw_data["personality"]
    if "personality_type" in raw_data:
        safe["personality"] = raw_data["personality_type"]

    # Categories — aggregated totals only, safe
    if "categories" in raw_data:
        safe["category_totals"] = raw_data["categories"]

    # Weekly trend — aggregated, safe
    if "weekly_trend" in raw_data:
        safe["weekly_trend"] = raw_data["weekly_trend"]

    # Alerts — strip any PII that might be in alert messages
    if "alerts" in raw_data:
        clean_alerts = []
        for alert in raw_data["alerts"]:
            if isinstance(alert, dict):
                clean_alerts.append(_strip_pii_from_text(alert.get("msg", "")))
            elif isinstance(alert, str):
                clean_alerts.append(_strip_pii_from_text(alert))
        safe["alerts"] = clean_alerts

    # Goals — only name, target, current amounts
    if "goals" in raw_data:
        safe_goals = []
        for g in raw_data["goals"]:
            safe_goals.append({
                "name": sanitize_goal_name(g.get("name", "")),
                "target": g.get("target_amount", g.get("target", 0)),
                "current": g.get("current_amount", g.get("current", 0))
            })
        safe["goals"] = safe_goals

    # NEVER include: phone, email, full descriptions, account numbers
    excluded_keys = {"phone", "email", "account_number", "aadhaar", "pan",
                     "address", "description", "transactions"}
    found_pii = excluded_keys.intersection(raw_data.keys())
    if found_pii:
        logger.warning(f"AI_GUARD: Stripped PII fields: {found_pii}")

    return safe


def sanitize_goal_name(name: str) -> str:
    """Sanitize goal name — remove any embedded PII."""
    return _strip_pii_from_text(name)[:50]
