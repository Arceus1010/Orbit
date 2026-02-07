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


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """
    Application lifespan manager.

    Handles startup and shutdown events for the application.
    - Startup: Verify database connection
    - Shutdown: Close database connections gracefully
    """
    # Startup: Check database connection
    print("🔄 Starting Orbit API...")
    print("🔄 Testing database connection...")

    if await check_db_connection():
        print("✅ Database connection successful!")
    else:
        print("❌ WARNING: Database connection failed! Check your DATABASE_URL in .env")

    yield

    # Shutdown: Close database connections
    print("🔄 Shutting down Orbit API...")
    print("🔄 Closing database connections...")
    await close_db()
    print("✅ Database connections closed. Goodbye!")


app = FastAPI(
    title="Orbit API",
    description="AI-powered project management API using Claude for intelligent task enhancement",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ======================
# Exception Handlers
# ======================

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler for unexpected errors.

    Catches all unhandled exceptions and returns a generic error response.
    In production, this prevents leaking sensitive implementation details.
    """
    # Log the full error in debug mode for troubleshooting
    if settings.DEBUG:
        import traceback
        print(f"❌ Unhandled exception: {exc}")
        print(traceback.format_exc())

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": "An unexpected error occurred. Please try again later."
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Custom handler for Pydantic validation errors.

    Provides cleaner error messages for invalid request data.
    """
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation error",
            "errors": exc.errors()
        }
    )


# ======================
# Include Routers
# ======================

app.include_router(auth_router)

@app.get("/")
def read_root():
    """
    Root endpoint - API welcome message.

    Returns:
        Welcome message with API information
    """
    return {
        "message": "Welcome to Orbit API! 🚀",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """
    Basic health check endpoint.

    Returns:
        Health status and API version
    """
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "service": settings.APP_NAME
    }

@app.get("/health/db")
async def database_health_check(db: AsyncSession = Depends(get_db)):
    """Check if database connection is working"""
    try:
        # Execute a simple query
        result = await db.execute(text("SELECT 1"))
        result.scalar()
        return {
            "status": "healthy",
            "database": "connected",
            "message": "Database connection successful"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }
