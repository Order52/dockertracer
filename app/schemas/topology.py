from pydantic import BaseModel
from typing import Dict, List

class TopologyNode(BaseModel):
    name: str
    ip: str
    port: str

class TopologyResponse(BaseModel):
    __root__: Dict[str, List[TopologyNode]]
