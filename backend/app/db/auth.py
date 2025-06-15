import motor.motor_tornado as mt

from app.config.settings import settings


def get_mongo_client():
    uri = (
        f"mongodb://{settings.DB_USERNAME}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/"
        "?ssl=true"
        "&replicaSet=globaldb"
        "&retrywrites=false"
        "&maxIdleTimeMS=120000"
        f"&appName=@{settings.DB_USERNAME}@"
        f"&connectTimeoutMS={settings.COSMOS_CONNECT_TIMEOUT}"
        f"&socketTimeoutMS={settings.COSMOS_SOCKET_TIMEOUT}"
        f"&serverSelectionTimeoutMS={settings.COSMOS_SERVER_SELECTION_TIMEOUT}"
    )

    client = mt.MotorClient(uri, tls=True)

    return client


MongoClient = get_mongo_client()
