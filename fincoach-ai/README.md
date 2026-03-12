# FinCoach AI 🚀

> An AI-powered personal financial coaching agent for Indian gig workers and freelancers.

![FinScore Dashboard Placeholder](https://via.placeholder.com/800x400.png?text=FinCoach+AI+Dashboard)

## 🎯 The Problem
People earn money, spend money, and by month end — nothing is left. They have no idea where it went. And no one tells them what to do about it.
Every financial app shows you the past (trackers), but nobody coaches you about the future.

**Who is the user:**
Ravi Kumar, 26, freelance developer. Earns ₹20k one month, ₹14k next. No fixed salary. No financial advisor. No savings discipline.

## 💡 The Solution
FinCoach AI analyzes your income and spending patterns, gives you a real-time **Financial Health Score (FinScore)**, detects risks before they hurt you, and talks to you like a personal CA — with advice built around YOUR exact numbers, not generic templates.

What makes it stand out:
1. **FinScore Engine:** A 0-100 behavioral health score based on consistency, goal progress, and streaks.
2. **Spending Personality:** AI profiles you into types like "Impulsive Spender" to help target your weak points.
3. **Live AI Coach:** An interactive chat using Groq (LLaMA-3) to provide real-time suggestions using your exact financials as context.

---

## 🏗️ Tech Stack
- **Frontend:** React + Recharts + Lucide Icons + Tailwind / Inline CSS (Dark Theme #0f172a)
- **Backend:** FastAPI (Python) + Pydantic
- **Database:** Elasticsearch Cloud Serverless
- **AI Brain:** Groq API (llama3-70b-8192)

---

## 🛠️ Quick Setup for the Team

### 1. Project Pre-requisites
- Node.js (v18+)
- Python 3.9+
- Git

### 2. Frontend Setup (React)
Open a new terminal:
```bash
cd frontend
npm install
npm start
```

### 3. Backend Setup (FastAPI & Elasticsearch)
Open a new terminal:
```bash
cd backend
python -m venv venv

# For Windows:
venv\Scripts\activate
# For Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Database Setup & Seeding
The backend requires a configured `.env` file containing exact Database and Groq API keys. (Provided by team lead).
Once the `.env` file is in `fincoach-ai/backend/.env`, run the seed script to populate the Elasticsearch database with Ravi's data (3 Goals, 30 Transactions, 1 Profile):
```bash
cd backend
python seed/seed_data.py
```
After successfully seeding, start the local server:
```bash
uvicorn main:app --reload
```
-> API Server will run at: `http://localhost:8000`

---

## 👥 Hackathon Team Roles

* **Person 1 (Dashboard Frontend):** React layout, FinScore gauge, Goal progress, Weekly bar charts, and Pie charts.
* **Person 2 (AI Coach & Alerts Frontend):** Live Chat Window, Alert Cards, Personality profile display, Add Transaction form.
* **Person 3 (Backend & AI integration):** FastAPI endpoints (`/dashboard`, `/chat`, `/insights`), Groq AI prompt engineering, wiring mock endpoints to real DB models.
* **Person 4 (Database & Infrastructure):** Elasticsearch mappings, python modules (`elastic_client`, `profile_db`), inserting seed data, defining Pydantic shape limits.

_"Not just what you spent — but who you are with money, and exactly how to get better."_
