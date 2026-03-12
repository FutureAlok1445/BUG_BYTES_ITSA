from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import dashboard, insights, chat, transactions, goals
from db import init_profile_if_not_exists, init_indices

app = FastAPI(title="FinCoach AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    print("Initializing DB...")
    init_indices()
    init_profile_if_not_exists("user_001")
    print("DB initialized!")

@app.get("/")
def health_check():
    return {"status": "FinCoach AI is live 🚀"}

app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(insights.router, prefix="/api", tags=["Insights"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(transactions.router, prefix="/api", tags=["Transactions"])
app.include_router(goals.router, prefix="/api", tags=["Goals"])
