from app.repositories.container import ContainerRepository
from app.models.container import ContainerNode
from app.schemas.container import ContainerCreateSchema

class ContainerService:
    def __init__(self, repo: ContainerRepository):
        self.repo = repo

    def add_container(self, payload: ContainerCreateSchema) -> ContainerNode:
        if self.repo.get_by_name(payload.name):
            raise ValueError(f"Container '{payload.name}' already exists.")
        
        clean_data = payload.model_dump()
        clean_data["network"] = clean_data["network"].strip().lower()
        return self.repo.create(clean_data)
