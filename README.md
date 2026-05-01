# FinCoach AI

An AI-powered personal financial coaching agent for Indian gig workers and freelancers.

## Team Setup Instructions

### Pre-requisites
- Node.js (v18+)
- Python 3.9+
- Git

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm start` (or your dev server command)

### Backend Setup
1. `cd backend`
2. `python -m venv venv`
3. Activate venv: `source venv/bin/activate` (Mac/Linux) or `venv\Scripts\activate` (Windows)
4. `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` and fill the keys.
6. `uvicorn main:app --reload`

Prompt 1:
To build a chatbot as powerful and "agentic" as FinCoach AI, you actually need two separate prompts: a Router Prompt (for the brain/reasoning) and an Advisor Prompt (for the personality and data).

Here is the "Master Set" based on your project's architecture:

1. The Router Prompt (The "Agentic" Brain)
This is used behind the scenes to decide if the AI needs tools like Google Search or Database access.

System Prompt: You are the Decision Layer for a Finance Agent. Your only job is to analyze the user's intent and determine if current real-time data is required.

Inputs to consider: Current news, stock prices, latest tax laws (e.g., 80C limits), or travel prices.

Logic:

If user asks "What was my last spend?", Return: NO (This is internal data).
If user asks "Is it a good time to buy gold?" or "What are the new tax slabs for 2025?", Return: YES: <search query>.
Constraint: Return ONLY "YES: [query]" or "NO". No explanation.

2. The Main Advisor Prompt (The Personality)
This is the prompt that generates the actual chat responses.

System Prompt: You are FinCoach AI, a high-performance financial health agent specialized for Indian gig workers. You are direct, data-driven, and slightly rebellious (like a "tough-love" coach).

Your Context: You will be provided with a TRANSACTION_DATA block. This is the absolute truth. If the user asks about their money, you MUST reference specific numbers from this block.

Operational Rules:

Data First: Never give generic advice. Instead of saying "You spend too much on food," say "You spent ₹14,200 on Swiggy last month, which is 58% of your income."
Constraint: Keep responses under 3 sentences. Be punchy.
The "Agentic" Edge: If external search results are provided in the context, synthesize them with the user's personal data to give a 10/10 recommendation.
No Hallucination: If data is missing, ask the user to upload a UPI statement.
Tone: Professional but informal. Use Indian currency (₹/Rs.).

3. The UI-Component Prompt (For insights/Alerts)
This is what makes your "Safe/Danger" cards appear.

System Prompt: You are a Financial Risk Engine. Your output must be a VALID JSON ARRAY only.

Task: Analyze the provided TRANSACTION_DATA and return 4 specific risk alerts.

Format:

json
[
  {
    "type": "danger",
    "icon": "🚨",
    "text": "Spend on 'Zomato' is 40% higher than last month.",
    "category": "Food",
    "urgency": "High"
  }
]
Constraint: Do not include any markdown or text outside the JSON.

Why this works:
Multi-Model Ready: This prompt structure works best when you fallback between models (like your multiModelAI logic).
RAG-Lite: By injecting the TRANSACTION_DATA directly into the system prompt, you turn a general LLM into a personal auditor.
Structured Feedback: By forcing the "Risk Engine" to return JSON, you separate the "Brains" from the "Beauty" (your React UI).

Prompt 2:
1. The Technology Stack (The "Tecktack")
We chose a high-performance, scalable stack that leverages modern AI orchestration:

Frontend: React.js with a custom high-fidelity UI system.
AI Ecosystem: Puter.js – This allows us to orchestrate multiple state-of-the-art LLMs (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro) with seamless model fallback.
Backend (API): FastAPI (Python) – Designed for high-concurrency requests and structured data processing.
Search Engine: DuckDuckGo API – Integrated for real-time web querying.
Styling: Vanilla CSS with a focus on modern aesthetics: Glassmorphism, Dynamic Micro-animations, and Premium HSL Color Palettes.
2. The Agentic Workflow (How it "Thinks")
The core of FinCoach AI is its Multi-Layered Reasoning Engine. When a user asks a question, the agent follows this autonomous flow:

Layer 1: Agentic Intent & Reasoning
The system performs a pre-flight "Reasoning Pass" to route the query between Hybrid RAG (uploaded data) and Traditional Search (web tools).

Live Market Info
Personal Audit
Retry 1
Retry 2
Retry 3
Streaming
JSON
User Query
Agentic Router
DuckDuckGo ToolTax Limits, Prices, News
Prompt Injection
UPI Statement InjectionReal Transaction Data
Multi-Model Resilience
GPT-4o
Claude 3.5
Gemini 1.5
JSON/Text Parser
AI Chat
Insights Engine
Layer 2: Tool Execution (Real-time Search)
If real-time info is needed, the Agent autonomously executes a Web Search Tool. It fetches snippets, analyzes them, and prepared a "Search Context" for the LLM.

Layer 3: Financial Context Synthesis
The system injects the user's specific financial profile (Income, Monthly Burn, Savings Rate, Suspicious Charges) into the prompt. This ensures the advice isn't generic—it's personalized.

Layer 4: Multi-Model Fallback Strategy
To ensure 100% uptime and the best reasoning quality, we use a cascading fallback:

Primary: GPT-4o / Claude 3.5 (Complex reasoning)
Secondary: Gemini 1.5 / Llama 3.1 (High-speed insights)
Tertiary: Local Logic (System fallback)
3. Key Technical Innovations
🧠 Personality Synthesis
The agent analyzes spending patterns to categorize users into "Financial Personalities" (e.g., Impulsive Spender vs. Smart Saver). This is done using zero-shot classification on raw transaction data.

🛡️ Automated Risk Profiling
The system continuously monitors for "Deep Signals":

Weekend Spikes: Detecting 3.4x higher spending on weekends.
Night-time Impulsivity: Identifying shopping trends after 9 PM.
Security Alerts: Flagging 2 AM unrecognized charges automatically.
📊 Structured Output Generation
By enforcing strict JSON schemas on LLM outputs, we bridge the gap between "Natural Language Chat" and "Structured UI Components" (like the Alert Cards and Burn Bars).

4. Solving the "Hallucination" Problem
Accuracy is critical in finance. FinCoach AI uses three layers of "Grounding" to ensure data integrity:

RAG (Retrieval-Augmented Generation): The agent doesn't "guess" your spending. We inject your real-time transaction history (the FIN context) directly into every reasoning cycle.
Web Grounding: By using the Web Search Tool, the AI verifies external facts (like current tax laws or market prices) instead of relying on its training data, which might be outdated.
Structured Constraints: By forcing the AI to return data in JSON format for analysis, we eliminate the "creative rambling" that often causes hallucinations in standard chatbots.
5. Our Competitive Advantage (Why We are Better)
Feature	standard Chatbots	FinCoach AI (Agentic)
Data Recency	Limited to Training Cutoff	Live Web Access (DuckDuckGo)
Reliability	Single Model (Fails if down)	Multi-Model Fallback (GPT-4o → Claude → Gemini)
Personalization	Generic Advice	User-Specific Personality Analysis
Actionability	Text only	Structured Alerts & Burn Forecasts
FinCoach AI is not just a conversation—it is a Decision Support System.

