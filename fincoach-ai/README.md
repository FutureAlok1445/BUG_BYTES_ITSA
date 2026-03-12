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
