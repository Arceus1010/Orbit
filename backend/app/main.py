import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.database import get_db, check_db_connection, close_db
from app.core.config import settings
from app.api.auth import router as auth_router
from app.api.projects import router as projects_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    logger.info("Starting Orbit API...")

    if await check_db_connection():
        logger.info("Database connection successful")
    else:
        logger.warning("Database connection failed! Check DATABASE_URL in .env")

    yield

    await close_db()
    logger.info("Orbit API shut down")


app = FastAPI(
    title="Orbit API",
    description="AI-powered project management API using Claude for intelligent task enhancement",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    logger.error(f"Unhandled exception: {exc}\n{traceback.format_exc()}")

    content: dict[str, str] = {
        "detail": "Internal server error",
        "message": "An unexpected error occurred. Please try again later.",
    }
    if settings.DEBUG:
        content["traceback"] = traceback.format_exc()

    return JSONResponse(status_code=500, content=content)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation error",
            "errors": exc.errors()
        }
    )


app.include_router(auth_router)
app.include_router(projects_router)


@app.get("/")
def read_root():
    return {
        "message": "Welcome to Orbit API",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "service": settings.APP_NAME
    }


@app.get("/health/db")
async def database_health_check(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(text("SELECT 1"))
        result.scalar()
        return {
            "status": "healthy",
            "database": "connected",
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }
