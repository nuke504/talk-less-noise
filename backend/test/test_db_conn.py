import pytest

from autologging import traced
from app.db.operations import convert_to_sync
from app.db.auth import MongoClient as client
from app.config.settings import settings


@pytest.fixture
@convert_to_sync
async def test_doc():
    return await client.dual.test.find_one({})


@traced
def test_db_conn(test_doc: dict):
    assert test_doc, "Not able to find document"
    assert test_doc["correctValue"] == settings.TEST_VALUE, "Not correct value"
