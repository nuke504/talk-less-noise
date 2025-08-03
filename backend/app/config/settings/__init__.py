import os
from pydantic import BaseSettings
from typing import List, Optional

DEPLOYMENT_ENV: str = os.getenv("ENV", "dev")  # Set ENV=production in Azure


def get_settings():
    if DEPLOYMENT_ENV == "production":
        from .prod import ProductionSettings

        return ProductionSettings()
    else:
        from .dev import DevSettings

        return DevSettings()


class Settings(BaseSettings):
    API_PREFIX: str = "/api"
    LOGGING_DIR: str = os.path.join(os.getenv("APP_HOME"), "app", "logs")
    TEST_VALUE: int = 101011
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # JWT Authentication settings
    SKIP_AUTH: bool = os.getenv("SKIP_AUTH", "false").lower() == "true"


class SurveySettings(BaseSettings):
    AREAS: List[str] = ["northeast", "north", "central", "west", "east"]
    AGE_GROUP: List[str] = ["<20", "20-29", "30-39", "40-49", "50-59", ">60"]

    NOISE_CATEGORIES: List[str] = [
        "pets",
        "furniture",
        "baby",
        "works",
        "music",
        "others",
    ]

    GROUP_BY_COLUMN_TYPE = Optional[List[str]]


survey_settings = SurveySettings()
settings = get_settings()
