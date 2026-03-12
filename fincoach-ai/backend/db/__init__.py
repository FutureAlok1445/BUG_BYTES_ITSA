"""DB package — re-exports all database functions for easy imports."""
from .elastic_client import es_client, init_indices, test_connection, MOCK_DASHBOARD_DATA
from .transactions_db import (
    get_all_transactions, insert_transaction,
    get_transactions_by_category, get_weekly_trend, get_monthly_totals
)
from .goals_db import get_all_goals, insert_goal, update_goal_progress
from .profile_db import get_profile, update_personality, increment_streak, init_profile_if_not_exists