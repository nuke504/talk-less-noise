import os
from typing import Optional
from . import Settings


class DevSettings(Settings):
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Let's talk less noise")
    DB_USERNAME: str = os.getenv("DB_USERNAME")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD")
    DB_HOST: str = os.getenv("DB_HOST")
    DB_PORT: int = os.getenv("DB_PORT")

    COSMOS_CONNECT_TIMEOUT: int = os.getenv("COSMOS_CONNECT_TIMEOUT", 10000)
    COSMOS_SOCKET_TIMEOUT: int = os.getenv("COSMOS_SOCKET_TIMEOUT", 10000)
    COSMOS_SERVER_SELECTION_TIMEOUT: int = os.getenv(
        "COSMOS_SERVER_SELECTION_TIMEOUT", 10000
    )

    SERVER_NAME: str = "dev"
    LOGGING_DIR: str = os.path.join(os.getenv("APP_HOME"), "app", "logs")
    TEST_VALUE: int = 101011

    AZURE_CLIENT_ID: Optional[str] = os.getenv("AZURE_CLIENT_ID")
    AZURE_TENANT_ID: Optional[str] = os.getenv("AZURE_TENANT_ID")
