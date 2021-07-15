from typing import Generator
from app.db.auth import MongoClient as client


async def get_session() -> Generator:
    session = await client.start_session()
    try:
        yield session
    finally:
        await session.end_session()
