import os
import multiprocessing

from pydantic import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    API_PREFIX: str = "/api"
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Let's talk less noise")

    DB_USERNAME: str = os.getenv("DB_USERNAME")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD")
    DB_HOST: str = os.getenv("DB_HOST")
    DB_PORT: int = os.getenv("DB_PORT")

    COSMOS_CONNECT_TIMEOUT: int = os.getenv("COSMOS_CONNECT_TIMEOUT", 10000)
    COSMOS_SOCKET_TIMEOUT: int =  os.getenv("COSMOS_SOCKET_TIMEOUT", 10000)
    COSMOS_SERVER_SELECTION_TIMEOUT: int = os.getenv("COSMOS_SERVER_SELECTION_TIMEOUT", 10000)

    SERVER_NAME: str = "dev"
    LOGGING_DIR: str = os.path.join(os.getenv("APP_HOME"), "app", "logs")
    # LOGGING_DIR: str = "/Users/starlight/Desktop/talk-less-noise/backend/app/logs"

    TEST_VALUE: int = 101011


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
settings = Settings()
