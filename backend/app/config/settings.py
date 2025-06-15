import os
from pydantic import BaseSettings
from typing import List, Optional

# Azure SDK imports
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from azure.appconfiguration import AzureAppConfigurationClient

DEPLOYMENT_ENV: str = os.getenv("ENV", "dev")  # Set ENV=production in Azure


def get_secret_from_keyvault(secret_name: str, vault_url: str):
    credential = DefaultAzureCredential()
    client = SecretClient(vault_url=vault_url, credential=credential)
    return client.get_secret(secret_name).value


def get_setting_from_appconfig(
    key: str, appconfig_endpoint: str, appconfig_credential=None
):
    if appconfig_credential is None:
        appconfig_credential = DefaultAzureCredential()
    client = AzureAppConfigurationClient(appconfig_endpoint, appconfig_credential)
    return client.get_configuration_setting(key=key).value


class Settings(BaseSettings):
    API_PREFIX: str = "/api"

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
    # LOGGING_DIR: str = "/Users/starlight/Desktop/talk-less-noise/backend/app/logs"

    TEST_VALUE: int = 101011


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


class ProductionSettings(Settings):
    # Azure resource identifiers (set as env vars in production)
    KEYVAULT_URL: str = os.getenv(
        "KEYVAULT_URL"
    )  # e.g., https://<your-keyvault>.vault.azure.net/
    APPCONFIG_ENDPOINT: str = os.getenv(
        "APPCONFIG_ENDPOINT"
    )  # e.g., https://<your-appconfig>.azconfig.io

    PROJECT_NAME: str = get_setting_from_appconfig("PROJECT_NAME", APPCONFIG_ENDPOINT)
    DB_USERNAME: str = get_secret_from_keyvault("DB-USERNAME", KEYVAULT_URL)
    DB_PASSWORD: str = get_secret_from_keyvault("DB-PASSWORD", KEYVAULT_URL)
    DB_HOST: str = get_secret_from_keyvault("DB-HOST", KEYVAULT_URL)
    DB_PORT: int = int(get_secret_from_keyvault("DB-PORT", KEYVAULT_URL))

    COSMOS_CONNECT_TIMEOUT: int = get_setting_from_appconfig(
        "COSMOS_CONNECT_TIMEOUT", APPCONFIG_ENDPOINT
    )
    COSMOS_SOCKET_TIMEOUT: int = get_setting_from_appconfig(
        "COSMOS_SOCKET_TIMEOUT", APPCONFIG_ENDPOINT
    )
    COSMOS_SERVER_SELECTION_TIMEOUT: int = get_setting_from_appconfig(
        "COSMOS_SERVER_SELECTION_TIMEOUT", APPCONFIG_ENDPOINT
    )

    SERVER_NAME: str = "prod"
    LOGGING_DIR: str = os.path.join(os.getenv("APP_HOME"), "app", "logs")
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
settings = ProductionSettings() if DEPLOYMENT_ENV == "production" else DevSettings()
