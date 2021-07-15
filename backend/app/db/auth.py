import motor.motor_tornado as mt

from app.config.settings import settings


def get_mongo_client():
    client = mt.MotorClient(
        f"mongodb+srv://{settings.DB_USERNAME}:{settings.DB_PASSWORD}@main.ml92n.mongodb.net",
        tls=True,
    )

    return client


MongoClient = get_mongo_client()
