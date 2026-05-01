from fastapi import FastAPI
from routes import dashboard, insights, chat, transactions, goals

app = FastAPI(title="FinCoach AI Backend")

app.include_router(dashboard.router)
app.include_router(insights.router)
app.include_router(chat.router)
app.include_router(transactions.router)
app.include_router(goals.router)

@app.get("/")
def read_root() -> dict:
    return {"message": "Welcome to FinCoach AI"}
