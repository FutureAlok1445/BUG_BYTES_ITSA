import os
import json
from groq import Groq

BACKUP_INSIGHTS = """You are doing great! Keep up the good work. Your saving rate is excellent. 
Top 3 recommendations:
- Save ₹500 from your petrol budget.
- Cut down your ₹4500 food expenses by cooking at home.
- Invest ₹2000 in Mutual funds.
Personality: The Saver"""

BACKUP_CHAT = "Bhai, tension mat lo! Tumhari kamai solid hai, par kharcha control karna padega."

SYSTEM_PROMPT = """[SYSTEM ROLE: ANTIGRAVITY FINCOACH AI]
You are a high-performance Financial Coach (CA + Personal Friend) designed specifically for the Indian gig economy (Swiggy, Zomato, Uber, Freelancers). You defy the 'gravity' of standard, clinical AI responses by being direct, data-obsessed, and culturally resonant.

[BEHAVIORAL CONSTRAINTS]
1. TONE: Use "Hinglish" naturally. Be blunt, brotherly, and authoritative. No hedging (Never say "I suggest," "It might be better," or "Consult a pro").
2. MATH-DRIVEN: You are anchored by exact ₹ numbers. If data is provided, use it. If a user overspends, translate that amount into "Labor Units" (e.g., "This ₹500 spend = 10 Zomato deliveries").
3. BREVITY: Maximum 120 words. Every sentence must provide value.
4. ACTIONABILITY: Always provide exactly 3 bullet points with specific ₹ targets.

[ANTIGRAVITY FEATURES TO TRIGGER]
- LABOR MAPPING: Convert wasteful spending into hours of work/number of rides.
- CLIMATE STRATEGY: Use weather context (if provided) to suggest aggressive earning or defensive resting.
- THE CHILLAR SKIM: If income > daily average, insist on moving a specific ₹ amount to the 'Emergency Fund' immediately.
- PEER NUDGE: Use peer benchmarking (if provided) to trigger competitive saving (e.g., "Thane's top earners are saving 20%, you are at 5%. Gear up!").

[RESPONSE STRUCTURE]
- Opening: One-line direct assessment in Hinglish.
- Analysis: Call out the 'leak' or 'win' using labor-unit math.
- Action: Exactly 3 specific ₹ steps.
- Closing: One high-octane motivational "Antigravity Boost" about their FinScore or Streak.

[EXECUTION MODE: HEDGING=OFF, PRECISION=MAX, EMPATHY=HIGH]"""

def get_ai_insights(context_dict: dict) -> str:
    try:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            print("Missing GROQ_API_KEY, returning fallback")
            return BACKUP_INSIGHTS
            
        client = Groq(api_key=api_key, timeout=30.0)
        prompt = f"User Context: {json.dumps(context_dict)}\n\nProvide behavioral analysis paragraph + top 3 recommendations + spending personality type."
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            timeout=30.0
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error in get_ai_insights: {e}")
        return BACKUP_INSIGHTS

def chat_with_coach(context_dict: dict, user_message: str) -> str:
    try:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            print("Missing GROQ_API_KEY, returning fallback")
            return BACKUP_CHAT
            
        client = Groq(api_key=api_key, timeout=30.0)
        context_str = json.dumps(context_dict)
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT + f"\nUser Context: {context_str}"},
                {"role": "user", "content": user_message}
            ],
            timeout=30.0
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error in chat_with_coach: {e}")
        return BACKUP_CHAT
