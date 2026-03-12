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

SYSTEM_PROMPT = """You are FinCoach AI — a warm, direct, and smart financial coach for everyday Indians, especially gig workers and freelancers. You speak like a trusted friend who happens to be a CA. RULES: Always use exact ₹ numbers from user data. Give exactly 3 actionable steps. Be specific with amounts. Never say 'it depends'. Keep response under 120 words. End with one motivational line about their streak or score. Reply in Hinglish if user writes in Hindi."""

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
