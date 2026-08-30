from fastapi import APIRouter
from .containers import router as containers_router
from .topology import router as topology_router

router = APIRouter()
router.include_router(containers_router)
router.include_router(topology_router)
