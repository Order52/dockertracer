from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.repositories.container import ContainerRepository
from app.services.container_service import ContainerService
from app.services.topology_service import TopologyService

def get_container_repo(db: Session = Depends(get_db)) -> ContainerRepository:
    return ContainerRepository(db)

def get_container_service(repo: ContainerRepository = Depends(get_container_repo)) -> ContainerService:
    return ContainerService(repo)

def get_topology_service(repo: ContainerRepository = Depends(get_container_repo)) -> TopologyService:
    return TopologyService(repo)
