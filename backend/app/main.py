"""FastAPI entrypoint for the daily-log-app backend."""
import logging
import os
import time
import uuid

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pythonjsonlogger import jsonlogger
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from .limiter import limiter
from .routers import auth, estimate, logs

# ── Structured JSON logging ──────────────────────────────────────────────────
handler = logging.StreamHandler()
handler.setFormatter(jsonlogger.JsonFormatter("%(asctime)s %(name)s %(levelname)s %(message)s"))
logging.root.setLevel(logging.INFO)
logging.root.handlers = [handler]
logger = logging.getLogger("daily-log")

# ── App ──────────────────────────────────────────────────────────────────────
IS_PROD = os.environ.get("ENV", "dev") == "production"

app = FastAPI(
    title="daily-log-app API",
    debug=not IS_PROD,
    # Hide docs in production
    docs_url=None if IS_PROD else "/docs",
    redoc_url=None if IS_PROD else "/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ─────────────────────────────────────────────────────────────────────
_default_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
_extra = os.environ.get("FRONTEND_ORIGINS", "")
_origins = _default_origins + [o.strip() for o in _extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Security headers + request logging middleware ────────────────────────────
@app.middleware("http")
async def request_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    start = time.perf_counter()

    response: Response = await call_next(request)

    elapsed_ms = round((time.perf_counter() - start) * 1000, 1)

    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Request-Id"] = request_id
    if IS_PROD:
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"

    logger.info(
        "request",
        extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status": response.status_code,
            "duration_ms": elapsed_ms,
        },
    )
    return response


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(logs.router)
app.include_router(estimate.router)


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    from .db import engine
    try:
        with engine.connect() as conn:
            from sqlalchemy import text
            conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False
    return {"status": "ok" if db_ok else "degraded", "db": db_ok}
