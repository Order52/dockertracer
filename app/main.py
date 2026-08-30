from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from app.api.routes import router as api_router
from app.core.database import engine, Base
import os

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DockerLens Lite", version="1.0.0")

# Mount static files
frontend_dir = os.path.join(os.getcwd(), "frontend")
app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

@app.get("/", include_in_schema=False)
def read_root():
    return RedirectResponse(url="/ui")

app.include_router(api_router)
