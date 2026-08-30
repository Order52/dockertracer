from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse, FileResponse
from app.services.topology_service import TopologyService
from app.api.dependencies import get_topology_service
import os

router = APIRouter()

@router.get("/api/topology/data")
def view_topology_json(service: TopologyService = Depends(get_topology_service)):
    return service.get_topology_map()

@router.get("/ui", response_class=HTMLResponse)
def view_topology_ui():
    index_path = os.path.join(os.getcwd(), "frontend", "index.html")
    return FileResponse(index_path)
