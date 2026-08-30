from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.container import ContainerCreateSchema, ContainerResponseSchema
from app.services.container_service import ContainerService
from app.api.dependencies import get_container_service

router = APIRouter()

@router.post("/containers", response_model=ContainerResponseSchema, status_code=status.HTTP_201_CREATED)
def register_container(payload: ContainerCreateSchema, service: ContainerService = Depends(get_container_service)):
    try:
        return service.add_container(payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
