from fastapi import FastAPI
from fastapi.responses import RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from app.api.routes import router as api_router
from app.core.database import engine, Base
import os

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Dockertracer Lite", version="1.0.0")

app.include_router(api_router)

# Serve static files from React build (frontend/dist)
frontend_dist_dir = os.path.join(os.getcwd(), "frontend", "dist")

if os.path.exists(frontend_dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist_dir, "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_react_app(full_path: str):
        # Serve index.html for all other routes to support React Router
        return FileResponse(os.path.join(frontend_dist_dir, "index.html"))
else:
    @app.get("/", include_in_schema=False)
    def read_root():
        return {"message": "Frontend build not found. Run 'npm run build' in the frontend directory."}
