from fastapi import APIRouter

from app.api.endpoints import survey, usage

api_router = APIRouter()
api_router.include_router(survey.router, prefix="/survey", tags=["survey"])
api_router.include_router(usage.router, prefix="/usage", tags=["usage"])
