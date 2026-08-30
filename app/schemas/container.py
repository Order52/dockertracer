from typing import Optional
from pydantic import BaseModel, Field

class ContainerCreateSchema(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, example="web-nginx", json_schema_extra={"example": "web-nginx"})
    network: str = Field(default="bridge", example="frontend-net", json_schema_extra={"example": "frontend-net"})
    ip_address: str = Field(..., example="172.20.0.2", json_schema_extra={"example": "172.20.0.2"})
    port: Optional[int] = Field(None, ge=1, le=65535, example=80, json_schema_extra={"example": 80})

class ContainerResponseSchema(BaseModel):
    id: int
    name: str
    network: str
    ip_address: str
    port: Optional[int]

    class Config:
        from_attributes = True
