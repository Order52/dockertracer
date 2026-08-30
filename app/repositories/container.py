from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.container import ContainerNode

class ContainerRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_name(self, name: str) -> Optional[ContainerNode]:
        return self.db.query(ContainerNode).filter(ContainerNode.name == name).first()

    def get_all(self) -> List[ContainerNode]:
        return self.db.query(ContainerNode).all()

    def create(self, data: dict) -> ContainerNode:
        node = ContainerNode(**data)
        self.db.add(node)
        self.db.commit()
        self.db.refresh(node)
        return node
