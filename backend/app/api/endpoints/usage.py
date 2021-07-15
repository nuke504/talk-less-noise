from fastapi import APIRouter, HTTPException, Depends
from pymongo.client_session import ClientSession
from autologging import logged

from app.api.deps import get_session
from app.db.operations import insert_one, update_one
from app.schemas.response import InsertOneResponse, UpdateOneResponse
from app.schemas.usage import AttemptStart, CheckpointStart, CheckpointEnd, AttemptEnd

router = APIRouter()


@logged
class Usage:
    # Post the start attempt
    @router.post("/attempt/start", status_code=201, response_model=InsertOneResponse)
    async def post_start_attempt(
        attempt: AttemptStart, session: ClientSession = Depends(get_session)
    ):
        Usage.__log.info(attempt.dict())
        return await insert_one(
            "usageStats", "journeyMap", attempt.dict(), session=session
        )

    # Update with checkpoint start
    @router.put("/checkpoint/start", response_model=UpdateOneResponse)
    async def update_checkpoint(
        checkpoint: CheckpointStart, session: ClientSession = Depends(get_session)
    ):
        update_dict = checkpoint.dict()
        update_query = {"attemptId": update_dict.pop("attemptId")}
        update = {"$push": {"checkpoints": update_dict}}
        custom_exception = HTTPException(
            status_code=404, detail="Unable to find matching attempt"
        )

        Usage.__log.info(update)
        return await update_one(
            "usageStats",
            "journeyMap",
            update_query,
            update,
            session=session,
            custom_exception=custom_exception,
        )

    # Update with checkpoint end
    @router.put("/checkpoint/end", response_model=UpdateOneResponse)
    async def update_checkpoint(
        checkpoint: CheckpointEnd, session: ClientSession = Depends(get_session)
    ):
        update_query = {
            "attemptId": checkpoint.attemptId,
        }
        update = {"$set": {"checkpoints.$[cp].end": checkpoint.end}}
        array_filters = [{"cp.description": checkpoint.description}]
        custom_exception = HTTPException(
            status_code=404, detail="Unable to find matching checkpoint"
        )

        Usage.__log.info(update)
        return await update_one(
            "usageStats",
            "journeyMap",
            update_query,
            update,
            array_filters=array_filters,
            session=session,
            custom_exception=custom_exception,
        )

    # Update with attempt end
    @router.put("/attempt/end", response_model=UpdateOneResponse)
    async def update_checkpoint(
        attempt: AttemptEnd, session: ClientSession = Depends(get_session)
    ):
        update_dict = attempt.dict()
        update_query = {"attemptId": update_dict.pop("attemptId")}
        update = {"$set": update_dict}
        custom_exception = HTTPException(
            status_code=404, detail="Unable to find matching attempt"
        )

        Usage.__log.info(update)
        return await update_one(
            "usageStats",
            "journeyMap",
            update_query,
            update,
            session=session,
            custom_exception=custom_exception,
        )
