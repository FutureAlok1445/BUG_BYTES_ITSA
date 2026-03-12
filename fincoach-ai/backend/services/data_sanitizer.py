"""
Data sanitizer — prepares data for safe external API consumption.
Re-exports AI data guard functions.
"""
from security.ai_data_guard import build_safe_ai_context, sanitize_goal_name

__all__ = ["build_safe_ai_context", "sanitize_goal_name"]
