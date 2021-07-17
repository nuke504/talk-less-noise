# import logging
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.api import api_router
from app.utils.logging import init_logging

init_logging(settings.LOGGING_DIR)

app = FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_PREFIX}/openapi.json"
)

# Allow CORS bypass
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "PUT"],
    allow_headers=["Content-Type"],
)

logging.info(f"Username:{settings.DB_USERNAME}")
logging.info(f"Password:{settings.DB_PASSWORD}")

app.include_router(api_router, prefix=settings.API_PREFIX)
