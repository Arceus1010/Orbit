from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.database import get_db, check_db_connection, close_db
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

# Include routers
app.include_router(auth_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Orbit API! 🚀"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

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
