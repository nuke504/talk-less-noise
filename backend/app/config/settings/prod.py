import os

from . import Settings
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from azure.appconfiguration import AzureAppConfigurationClient

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

    ENTRA_AUD: str = get_secret_from_keyvault("API-AUD", KEYVAULT_URL)
    AZURE_TENANT_ID: str = get_secret_from_keyvault("API-TENANT-ID", KEYVAULT_URL)