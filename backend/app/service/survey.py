from typing import List, Dict, Tuple
from autologging import traced
from pymongo.client_session import ClientSession

from app.db.operations import aggregate
from app.config.settings import survey_settings as settings


def prepare_group_by_columns(group_by_columns) -> Tuple[Dict[str, str], Dict[str, str]]:
    if group_by_columns:
        group_by_columns_pipeline = {col: f"${col}" for col in group_by_columns}
        group_by_columns_project = {col: f"$_id.{col}" for col in group_by_columns}
    else:
        group_by_columns_pipeline = None
        group_by_columns_project = {}

    return group_by_columns_pipeline, group_by_columns_project


@traced
async def noise_collation_svc(
    session: ClientSession, group_by_columns: settings.GROUP_BY_COLUMN_TYPE = None
) -> List[Dict]:

    count_pipeline = [{"$count": "count"}]
    total_cursor = await aggregate(
        "surveyAnswers", "noiseCollation", count_pipeline, session=session
    )
    try:
        total_documents = await total_cursor.next()
    except StopAsyncIteration:
        return []

    group_by_columns_pipeline, group_by_columns_project = prepare_group_by_columns(
        group_by_columns
    )

    aggregate_pipeline = [
        {"$group": {"_id": group_by_columns_pipeline, "count": {"$sum": 1}}},
        {
            "$project": {
                **group_by_columns_project,
                "_id": 0,
                "count": 1,
                "percentage": {
                    "$multiply": [
                        {"$divide": ["$count", total_documents["count"]]},
                        100,
                    ],
                },
            }
        },
    ]

    cursor = await aggregate(
        "surveyAnswers", "noiseCollation", aggregate_pipeline, session=session
    )
    results = [doc async for doc in cursor]
    return results


@traced
async def quiet_hours_svc(
    session: ClientSession, group_by_columns: settings.GROUP_BY_COLUMN_TYPE = None
) -> List[Dict]:

    # Process the group_by_columns
    if not group_by_columns:
        group_by_columns = []

    group_by_columns_select = {col: 1 for col in group_by_columns}
    group_by_columns_group_by = {col: f"${col}" for col in group_by_columns}
    group_by_columns_project = {col: f"$_id.{col}" for col in group_by_columns}

    aggregate_pipeline = [
        {"$unwind": "$hours"},
        {
            "$project": {
                **group_by_columns_select,
                "hoursArray": {
                    "$cond": {
                        "if": {"$gt": ["$hours.start", "$hours.end"]},
                        "then": {
                            "$concatArrays": [
                                {"$range": ["$hours.start", 24, 1]},
                                {"$range": [0, "$hours.end", 1]},
                            ],
                        },
                        "else": {"$range": ["$hours.start", "$hours.end", 1]},
                    },
                },
            },
        },
        {"$unwind": "$hoursArray"},
        {"$project": {"quietHour": "$hoursArray", **group_by_columns_select}},
        {
            "$group": {
                "_id": {"quietHour": "$quietHour", **group_by_columns_group_by},
                "count": {"$sum": 1},
            }
        },
        {
            "$project": {
                "quietHour": "$_id.quietHour",
                "count": 1,
                "_id": 0,
                **group_by_columns_project,
            }
        },
        {"$sort": {**group_by_columns_select, "quietHour": 1}},
    ]

    cursor = await aggregate(
        "surveyAnswers", "quietHours", aggregate_pipeline, session=session
    )
    results = [doc async for doc in cursor]

    return results


@traced
async def threshold_svc(
    session: ClientSession, group_by_columns: settings.GROUP_BY_COLUMN_TYPE = None
) -> List[Dict]:

    group_by_columns_pipeline, group_by_columns_project = prepare_group_by_columns(
        group_by_columns
    )

    aggregate_pipeline = [
        {
            "$group": {
                "_id": group_by_columns_pipeline,
                "noisyThreshold": {"$avg": "$noisyThreshold"},
                "niceThreshold": {"$avg": "$niceThreshold"},
            }
        },
        {
            "$project": {
                **group_by_columns_project,
                "_id": 0,
                "noisyThreshold": 1,
                "niceThreshold": 1,
            }
        },
    ]

    cursor = await aggregate(
        "surveyAnswers", "threshold", aggregate_pipeline, session=session
    )
    results = [doc async for doc in cursor]
    return results
