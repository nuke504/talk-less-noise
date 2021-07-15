from fastapi import APIRouter, Query, Depends
from typing import List, Dict
from pymongo.client_session import ClientSession
from autologging import logged

from app.api.deps import get_session
from app.schemas.survey import NoiseCollation, QuietHours, Threshold
from app.schemas.response import InsertOneResponse
from app.db.operations import insert_one
from app.service.survey import noise_collation_svc, quiet_hours_svc, threshold_svc
from app.config.settings import survey_settings as settings

router = APIRouter()


@logged
class SurveyAPI:

    # Post Request on Noise Collation
    @router.post("/noiseCollation", status_code=201, response_model=InsertOneResponse)
    async def noise_collation_post(
        noise_collation: NoiseCollation, session: ClientSession = Depends(get_session)
    ):
        SurveyAPI.__log.info(noise_collation.dict())
        return await insert_one(
            "surveyAnswers", "noiseCollation", noise_collation.dict(), session=session
        )

    # Get Request on Noise Collation
    @router.get("/noiseCollation", response_model=List[Dict])
    async def noise_collation_get(
        group_by_columns: settings.GROUP_BY_COLUMN_TYPE = Query(
            None,
            title="Group By Columns",
            description="Columns to group by when getting percentage and count",
        ),
        session: ClientSession = Depends(get_session),
    ):
        SurveyAPI.__log.info(group_by_columns)
        return await noise_collation_svc(
            session=session, group_by_columns=group_by_columns
        )

    # Post Request on Quiet Hours
    @router.post("/quietHours", status_code=201, response_model=InsertOneResponse)
    async def quiet_hours_post(
        quiet_hours: QuietHours, session: ClientSession = Depends(get_session)
    ):
        SurveyAPI.__log.info(quiet_hours.dict())
        return await insert_one(
            "surveyAnswers", "quietHours", quiet_hours.dict(), session=session
        )

    # Get Request on Quiet Hours
    @router.get("/quietHours", response_model=List[Dict])
    async def quiet_hours_get(
        group_by_columns: settings.GROUP_BY_COLUMN_TYPE = Query(
            None,
            title="Group By Columns",
            description="Columns to group by when getting quiet hours",
        ),
        session: ClientSession = Depends(get_session),
    ):
        SurveyAPI.__log.info(group_by_columns)
        return await quiet_hours_svc(session=session, group_by_columns=group_by_columns)

    # Post Request on Noisy Threshold
    @router.post("/threshold", status_code=201, response_model=InsertOneResponse)
    async def threshold_post(
        noisy_threshold: Threshold, session: ClientSession = Depends(get_session)
    ):
        SurveyAPI.__log.info(noisy_threshold.dict())
        return await insert_one(
            "surveyAnswers", "threshold", noisy_threshold.dict(), session=session
        )

    # Get Request on Noisy Threshold
    @router.get("/threshold", response_model=List[Dict])
    async def threshold_get(
        group_by_columns: settings.GROUP_BY_COLUMN_TYPE = Query(
            None,
            title="Group By Columns",
            description="Columns to group by when getting thresholds",
        ),
        session: ClientSession = Depends(get_session),
    ):
        SurveyAPI.__log.info(group_by_columns)
        return await threshold_svc(session=session, group_by_columns=group_by_columns)
