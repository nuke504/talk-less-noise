import pytest

from typing import Generator
from fastapi.testclient import TestClient
from app.main import app
from app.config.settings import settings


@pytest.fixture(scope="module")
def client() -> Generator:
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def api_prefix() -> Generator:
    yield settings.API_PREFIX
