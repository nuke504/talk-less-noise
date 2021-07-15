import asyncio
import uuid
import numpy as np

from functools import wraps
from typing import Generator
from bson import ObjectId
from app.db.operations import insert_many, delete_many, delete_one
from app.config.settings import survey_settings


def attempt_id():
    return f"test-{uuid.uuid1()}"


def location():
    return np.random.choice(survey_settings.AREAS)


def assert_http_response(status_code: int = 200, **assertion_args):
    def decorator_wrapper(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            response = func(*args, **kwargs)

            try:
                assert response.status_code == status_code
            except:
                raise ValueError(f"Response has wrong status code: {response}")

            response_json = response.json()
            for key, value in assertion_args.items():
                assert response_json[key] == value

            return response

        return wrapper

    return decorator_wrapper


def insert_delete_tests(total: int = 10000):
    def decorator_wrapper(func):
        @wraps(func)
        def wrapper(*args, **kwargs) -> Generator:
            documents = []
            attempt_ids = []
            # Generate documents
            for _ in range(total):
                doc = func(*args, **kwargs)
                db = args[0].db
                collection = args[0].collection
                documents.append(doc)
                attempt_ids.append(doc["attemptId"])

            # Insert all documents
            loop = asyncio.get_event_loop()
            response = loop.run_until_complete(insert_many(db, collection, documents))
            assert response.acknowledged, f"Insertion operation failed, {response}"

            yield documents

            # Cleanup by deleting all documents
            query = {"attemptId": {"$in": attempt_ids}}
            loop = asyncio.get_event_loop()
            response = loop.run_until_complete(delete_many(db, collection, query))
            assert response.acknowledged, f"Delete operation failed, {response}"
            assert (
                response.deletedCount == total
            ), f"Delete operation did not delete all test documents, {response.deletedCount} deleted"

        return wrapper

    return decorator_wrapper


def delete_post(func):
    @wraps(func)
    def wrapper(*args, **kwargs) -> Generator:
        db = args[0].db
        collection = args[0].collection
        post_response = func(*args, **kwargs)
        yield post_response

        # Cleanup by deleting all documents
        query = {"_id": ObjectId(post_response.json()["insertedId"])}
        loop = asyncio.get_event_loop()
        response = loop.run_until_complete(delete_one(db, collection, query))
        assert response.acknowledged, f"Delete operation failed, {response}"
        assert (
            response.deletedCount == 1
        ), f"Delete operation did not delete all test documents, {response.deletedCount} deleted"

    return wrapper
