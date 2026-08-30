from sqlalchemy import Column, Integer, String, CheckConstraint, Index
from app.core.database import Base

class ContainerNode(Base):
    __tablename__ = "containers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True)
    network = Column(String(50), nullable=False, index=True)
    ip_address = Column(String(45), nullable=False)
    port = Column(Integer, nullable=True)

    __table_args__ = (
        CheckConstraint("port >= 1 AND port <= 65535", name="chk_valid_port"),
        Index("idx_net_ip", "network", "ip_address"),
    )
