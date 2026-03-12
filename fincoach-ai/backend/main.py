"""
FinCoach AI — Production-ready FastAPI backend.
AI-powered financial coaching for Indian gig workers.
"""
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from config import settings
from security.rate_limiter import limiter
from db import init_indices, init_profile_if_not_exists, test_connection
from routes import dashboard, insights, chat, transactions, goals, reports

# --- Logging ---
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(name)s | %(levelname)s | %(message)s")
logger = logging.getLogger("fincoach")


# --- Lifespan (startup/shutdown) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    print("\n" + "=" * 50)
    print("🚀 FinCoach AI Backend Starting...")
    print("=" * 50)
    print(f"  Environment: {settings.ENVIRONMENT}")
    print(f"  Groq API: {'✅ Configured' if settings.GROQ_API_KEY else '⚠️ Missing (fallback mode)'}")
    print(f"  Elastic: {'✅ Configured' if settings.ELASTIC_NODE else '⚠️ Missing (mock data mode)'}")

    # Test Elasticsearch connection (don't crash if slow)
    es_ok = test_connection()
    if es_ok:
        print("  ES Connection: ✅ Connected")
        init_indices()
        init_profile_if_not_exists(settings.USER_ID)
    else:
        print("  ES Connection: ⚠️ Not available (using mock data)")

    print("=" * 50)
    print("✅ FinCoach AI Backend Ready!")
    print("=" * 50 + "\n")

    yield  # App runs here

    print("FinCoach AI Backend shutting down...")


# --- FastAPI App ---
app = FastAPI(
    title="FinCoach AI API",
    description="AI-powered financial coaching for Indian gig workers and freelancers",
    version="1.0.0",
    lifespan=lifespan
)

# --- Rate Limiter ---
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Security Headers Middleware ---
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


# --- Global Exception Handlers ---
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors with clear messages."""
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(f) for f in error.get("loc", []))
        errors.append({"field": field, "message": error.get("msg", "Invalid value")})
    return JSONResponse(status_code=422, content={"detail": "Validation failed", "errors": errors})


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions with clean JSON responses."""
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors — never expose stack traces."""
    logger.error(f"Unhandled error: {type(exc).__name__}: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Something went wrong. Please try again."})


# --- Health Check Endpoints ---
@app.get("/")
def root():
    """Root health check endpoint."""
    return {
        "status": "FinCoach AI is live 🚀",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT
    }


@app.get("/health")
def health_check():
    """Detailed health check for deployment platforms."""
    es_ok = test_connection()
    groq_ok = bool(settings.GROQ_API_KEY)
    return {
        "elasticsearch": "ok" if es_ok else "fail",
        "groq": "ok" if groq_ok else "fail",
        "status": "healthy" if es_ok else "degraded"
    }


# --- Register Routers ---
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(insights.router, prefix="/api", tags=["Insights"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(transactions.router, prefix="/api", tags=["Transactions"])
app.include_router(goals.router, prefix="/api", tags=["Goals"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])
