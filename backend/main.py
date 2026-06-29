from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router
from api.auth import router as auth_router
from api.sessions import router as sessions_router
from api.interview import router as interview_router

from contextlib import asynccontextmanager
from core.db import init_db

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from core.limiter import limiter

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database
    init_db()
    yield
    # Shutdown logic (if any)

app = FastAPI(
    title="AI Recruiter API",
    description="Backend API for AI Recruiter Hiring Copilot",
    version="1.0.0",
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://10.100.143.56:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(sessions_router, prefix="/api/v1/sessions")
app.include_router(interview_router, prefix="/api/v1")

from fastapi.responses import JSONResponse
import logging
try:
    from google.genai.errors import APIError
    @app.exception_handler(APIError)
    async def genai_api_error_handler(request: Request, exc: APIError):
        logging.error(f"GenAI API Error: {exc.message}")
        status_code = exc.code if hasattr(exc, 'code') and exc.code else 503
        # Ensure status code is valid for HTTP (e.g. 429, 503)
        if status_code < 400 or status_code > 599:
            status_code = 503
        return JSONResponse(
            status_code=status_code,
            content={"detail": "AI service is currently unavailable or rate limited. Please wait a moment and try again."},
        )
except ImportError:
    pass

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ai-recruiter"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
