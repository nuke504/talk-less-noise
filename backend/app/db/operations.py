import asyncio

from fastapi import HTTPException
from functools import wraps
from typing import List, Optional

from app.db.auth import MongoClient as client
from app.schemas.response import (
    InsertManyResponse,
    InsertOneResponse,
    UpdateOneResponse,
    DeleteResponse,
)
from pymongo.collection import Collection
from pymongo.client_session import ClientSession
from motor.motor_tornado import MotorCommandCursor


def convert_to_sync(func):
    @wraps(func)
    def wrapper(*args, **kwargs) -> dict:
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(func(*args, **kwargs))

    return wrapper


def verify_collection(func):
    @wraps(func)
    async def wrapper(database: str, collection_name: str, *args, **kwargs):
        db = client[database]
        concat_name = f"{database}_{collection_name}"
        if getattr(verify_collection, concat_name, False):
            return await func(db[collection_name], *args, **kwargs)
        else:
            collection_names = await db.list_collection_names()

            if not collection_name in collection_names:
                raise ValueError(
                    f"Collection {collection_name} does not exist in {database}"
                )

            setattr(verify_collection, concat_name, True)
            return await func(db[collection_name], *args, **kwargs)

    return wrapper


def propagate_error(func):
    @wraps(func)
    async def wrapper(collection: Collection, *args, **kwargs):
        try:
            return await func(collection, *args, **kwargs)
        except Exception as err:
            if hasattr(err, "details"):
                raise HTTPException(status_code=500, detail=err.details)
            else:
                raise err

    return wrapper


@propagate_error
@verify_collection
async def insert_one(
    collection: Collection, document: dict, session: Optional[ClientSession] = None
) -> InsertOneResponse:
    response = await collection.insert_one(document, session=session)
    return InsertOneResponse(
        acknowledged=response.acknowledged, insertedId=str(response.inserted_id)
    )


@propagate_error
@verify_collection
async def insert_many(
    collection: Collection,
    documents: List[dict],
    session: Optional[ClientSession] = None,
) -> InsertManyResponse:
    response = await collection.insert_many(documents, session=session)
    return InsertManyResponse(
        acknowledged=response.acknowledged,
        insertedIds=[str(iid) for iid in response.inserted_ids],
    )


@propagate_error
@verify_collection
async def update_one(
    collection: Collection,
    filterQuery: dict,
    update: dict,
    array_filters: Optional[List[dict]] = None,
    session: Optional[ClientSession] = None,
    custom_exception: Optional[HTTPException] = None,
) -> UpdateOneResponse:
    response = await collection.update_one(
        filterQuery, update, array_filters=array_filters, session=session
    )

    if custom_exception and response.matched_count == 0:
        raise custom_exception

    return UpdateOneResponse(
        acknowledged=response.acknowledged,
        matchedCount=response.matched_count,
        modifiedCount=response.modified_count,
    )


@propagate_error
@verify_collection
async def delete_one(
    collection: Collection, filterQuery: dict, session: Optional[ClientSession] = None
) -> DeleteResponse:
    response = await collection.delete_one(filterQuery, session=session)

    return DeleteResponse(
        acknowledged=response.acknowledged, deletedCount=response.deleted_count
    )


@propagate_error
@verify_collection
async def delete_many(
    collection: Collection, filterQuery: dict, session: Optional[ClientSession] = None
) -> DeleteResponse:
    response = await collection.delete_many(filterQuery, session=session)

    return DeleteResponse(
        acknowledged=response.acknowledged, deletedCount=response.deleted_count
    )


@propagate_error
@verify_collection
async def find_one(
    collection: Collection, filterQuery: dict, session: Optional[ClientSession] = None
) -> Optional[dict]:
    return await collection.find_one(filterQuery, session=session)


@propagate_error
@verify_collection
async def aggregate(
    collection: Collection,
    pipeline: List[dict],
    session: Optional[ClientSession] = None,
) -> MotorCommandCursor:
    return collection.aggregate(pipeline, session=session)


# if __name__ == "__main__":
# import asyncio
# from datetime import datetime
# import numpy as np
# from app.config.settings import survey_settings

# document = {
#     "attemptId": "testApp-12",
#     "area": "angMoKio",
#     "documentTime": datetime.now(),
#     "noiseCategory": "baby",
# }

# loop = asyncio.get_event_loop()
# response = loop.run_until_complete(
#     insert_one("surveyAnswers", "noiseCollation", document)
# )
# print(response)

# document = {
#     "attemptId": "testApp-11",
#     "area": "angMoKio",
#     "documentTime": datetime.now(),
#     "noiseCategory": "baby",
# }

# loop = asyncio.get_event_loop()
# response = loop.run_until_complete(
#     insert_one("surveyAnswers", "noiseCollation", document)
# )
# print(response)

# total = 10000
# documents = []
# random_areas = np.random.choice(survey_settings.AREAS, size=total)
# random_categories = np.random.choice(survey_settings.NOISE_CATEGORIES, size=total)

# for i in range(total):
#     documents.append(
#         {
#             "attemptId": f"testApp-{i}",
#             "area": random_areas[i],
#             "documentTime": datetime.now(),
#             "noiseCategory": random_categories[i],
#         }
#     )
# total = 1000
# documents = []
# random_areas = np.random.choice(survey_settings.AREAS, size=total)
# random_noisy_threshold = np.random.uniform(0, 10, size=total)
# random_nice_threshold = np.random.uniform(0, 10, size=total)
# possible_categories = [
#     [{"start": 23, "end": 6}],
#     [{"start": 23, "end": 6}, {"start": 16, "end": 18}],
#     [{"start": 10, "end": 17}],
# ]
# random_hours = np.random.choice(possible_categories, size=total).tolist()
# new_random_hours = []
# for idx, doc in enumerate(random_hours):
#     new_hour_ranges = []
#     for hour_range in doc:
#         new_hour_range = {}
#         new_hour_range["start"] = hour_range["start"] + max(
#             min(int(np.random.normal(0, 1)), 3), -3
#         )
#         new_hour_range["end"] = hour_range["end"] + max(
#             min(int(np.random.normal(0, 1)), 3), -3
#         )
#         new_hour_range["start"] = min(23, new_hour_range["start"])
#         new_hour_range["end"] = min(23, new_hour_range["end"])
#         new_hour_ranges.append(new_hour_range)

#     new_random_hours.append(new_hour_ranges)

# print(random_hours)

# for i in range(total):
#     documents.append(
#         {
#             "attemptId": f"testApp-{i}",
#             "area": random_areas[i],
#             "documentTime": datetime.now(),
#             "noiseCategory": random_categories[i],
#             "noisyThreshold": random_noisy_threshold[i],
#             "niceThreshold": random_nice_threshold[i],
#         }
#     )

# loop = asyncio.get_event_loop()

# document = {
#     "attemptId": "testApp-1",
#     "area": "angMoKio",
#     "startTime": datetime.now(),
# }

# response = loop.run_until_complete(insert_one("usageStats", "journeyMap", document))
# print(response)

# filterQuery = {"attemptId": "testApp-1"}
# update = {
#     "$push": {"checkpoints": {"description": "newTest", "start": datetime.now()}}
# }
# response = loop.run_until_complete(
#     update_one("usageStats", "journeyMap", filterQuery=filterQuery, update=update)
# )
# print(response.acknowledged)

# filterQuery = {"attemptId": "testApp-1", "checkpoints.description": "newTest"}
# update = {"$set": {"checkpoints.$.end": datetime.now()}}
# response = loop.run_until_complete(
#     update_one("usageStats", "journeyMap", filterQuery=filterQuery, update=update)
# )
# print(response.acknowledged)

# filterQuery = {"attemptId": "testApp-1"}
# update = {
#     "$push": {
#         "checkpoints": {
#             "description": "test",
#             "start": datetime.now(),
#             "end": datetime.now(),
#         }
#     }
# }
# response = loop.run_until_complete(
#     update_one("usageStats", "journeyMap", filterQuery=filterQuery, update=update)
# )
# print(response.acknowledged)

# loop = asyncio.get_event_loop()

