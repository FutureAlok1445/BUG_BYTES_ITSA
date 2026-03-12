import { useState, useEffect, useCallback } from 'react';
import { getDashboard } from '../api';

const MOCK_DATA = {
  profile: {
    name: "Ravi",
    finscore: 67,
    personality_type: "Impulsive Spender",
    streak_days: 12,
    income_type: "Freelance"
  },
  income: 34000,
  spent: 28500,
  saved: 5500,
  savings_rate: 0.1617,
  categories: {
    Food: 9800,
    Transport: 3200,
    Entertainment: 2100,
    Rent: 12000,
    Bills: 850,
    Shopping: 550
  },
  weekly_trend: {
    W1: 4200,
    W2: 6800,
    W3: 9500,
    W4: 8000
  },
  goals: [
    { name: "Emergency Fund", target_amount: 50000, current_amount: 40000, deadline: "2026-06-30", progress_pct: 80 },
    { name: "New Bike", target_amount: 85000, current_amount: 10200, deadline: "2026-12-31", progress_pct: 12 },
    { name: "Goa Trip", target_amount: 24000, current_amount: 5100, deadline: "2026-10-15", progress_pct: 21 }
  ],
  alerts: [
    { type: "warning", msg: "🟡 Spending at 84% of income. Tighten up this week.", code: "HIGH_SPEND" },
    { type: "warning", msg: "🟡 Food ₹9800 = 29% of income. Healthy limit: 20%", code: "FOOD_OVERSPEND" },
    { type: "info", msg: "📅 Month-end forecast: ₹1200 remaining", code: "FORECAST" }
  ],
  forecast: 1200,
  weekly_budget: {
    this_week_budget: 4500,
    this_week_spent: 3200,
    remaining_today: 650,
    daily_safe_limit: 786
  }
};

export function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    const result = await getDashboard();
    
    if (result) {
      setData(result);
      setError(false);
    } else {
      setData(MOCK_DATA);
      setError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, error, refetch: fetchDashboard };
}
