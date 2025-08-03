# import logging
import logging

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.api import api_router
from app.utils.logging import init_logging
from app.auth import get_current_user

init_logging(settings.LOGGING_DIR)

# Apply JWT authentication globally unless in dev/test mode
dependencies = []
if not settings.SKIP_AUTH and settings.AZURE_TENANT_ID and settings.AZURE_CLIENT_ID:
    dependencies = [Depends(get_current_user)]

app = FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_PREFIX}/openapi.json",
    dependencies=dependencies
)

# Allow CORS bypass
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type", "Authorization",
        "request-context", "request-id", "traceparent", "x-client-name"
    ],
    allow_credentials=True,
)

app.include_router(api_router, prefix=settings.API_PREFIX)
