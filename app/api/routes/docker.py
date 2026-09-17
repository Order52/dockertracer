from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.docker_service import DockerService
from typing import Optional, List
import subprocess

router = APIRouter()
docker_svc = DockerService()

class DeployRequest(BaseModel):
    name: str
    image: str
    ports: Optional[str] = None
    envs: Optional[str] = None

class ConnectRequest(BaseModel):
    source: str
    target: str

class PullRequest(BaseModel):
    image: str

class TopologyNode(BaseModel):
    name: str
    image: str
    ports: Optional[str] = None
    envs: Optional[str] = None

class TopologyEdge(BaseModel):
    source: str
    target: str

class LaunchTopologyRequest(BaseModel):
    nodes: List[TopologyNode]
    edges: List[TopologyEdge]

@router.get("/api/docker/images")
def get_images():
    return docker_svc.list_images()

@router.post("/api/docker/pull")
def pull_image(req: PullRequest):
    res = docker_svc.pull_image(req.image)
    if res.get("status") == "error":
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res

@router.post("/api/docker/launch_topology")
def launch_topology(req: LaunchTopologyRequest):
    nodes_data = [n.model_dump() for n in req.nodes]
    edges_data = [e.model_dump() for e in req.edges]
    res = docker_svc.launch_topology(nodes_data, edges_data)
    return res

@router.post("/api/docker/terminal/{container_name}")
def open_terminal(container_name: str):
    import docker
    try:
        container = docker_svc.client.containers.get(container_name)
        if container.status != "running":
            raise HTTPException(status_code=400, detail="Container is not running")
            
        script = f'''
        tell application "Terminal"
            do script "docker exec -it {container_name} /bin/sh"
            activate
        end tell
        '''
        subprocess.run(["osascript", "-e", script])
        return {"status": "success"}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Container not found")

class StopTopologyRequest(BaseModel):
    nodes: List[TopologyNode]

@router.post("/api/docker/stop_topology")
def stop_topology(req: StopTopologyRequest):
    nodes_data = [n.model_dump() for n in req.nodes]
    res = docker_svc.stop_topology(nodes_data)
    return res

@router.delete("/api/docker/containers/{container_name}")
def remove_container(container_name: str):
    res = docker_svc.remove_container(container_name)
    if res.get("status") == "error":
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res

