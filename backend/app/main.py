import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
from app.core.config import settings
from app.db.database import init_db
from app.db.seed import seed_users
from app.api import auth, users, projects, tasks, transcript

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema and seed demo accounts if empty
    init_db()
    seed_users()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

# CORS configuration
configured_origins = [o.strip() for o in settings.FRONTEND_ORIGIN.split(",") if o.strip()]
origins = list(set([
    *configured_origins,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]))
allow_all = "*" in origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all else origins,
    allow_credentials=not allow_all,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api
api_prefix = "/api"
app.include_router(auth.router, prefix=api_prefix)
app.include_router(users.router, prefix=api_prefix)
app.include_router(projects.router, prefix=api_prefix)
app.include_router(tasks.router, prefix=api_prefix)
app.include_router(transcript.router, prefix=api_prefix)

@app.get("/health")
def health_check():
    return {"status": "ok", "app": settings.PROJECT_NAME}

@app.get("/api/health")
def api_health_check():
    return {"status": "ok", "app": settings.PROJECT_NAME}

# Optionally serve frontend production build if present
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api/") or full_path == "api":
            return {"detail": "Not Found"}
        target_file = frontend_dist / full_path
        if target_file.is_file():
            return FileResponse(target_file)
        return FileResponse(frontend_dist / "index.html")
