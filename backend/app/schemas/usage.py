from typing import Optional
from datetime import datetime

from app.schemas import Attempt


class AttemptStart(Attempt):
    startTime: datetime
    area: str

    class Config:
        schema_extra = {
            "example": {
                "attemptId": "<machine>-<uuid>",
                "startTime": "2021-07-10T21:28:51.860777",
                "area": "angMoKio",
            }
        }


class CheckpointStart(Attempt):
    description: str
    start: datetime

    class Config:
        schema_extra = {
            "example": {
                "attemptId": "<machine>-<uuid>",
                "description": "noiseCollation",
                "start": "2021-07-10T21:28:51.860777",
            }
        }


class CheckpointEnd(Attempt):
    description: str
    end: datetime

    class Config:
        schema_extra = {
            "example": {
                "attemptId": "<machine>-<uuid>",
                "description": "noiseCollation",
                "end": "2021-07-10T21:28:51.860777",
            }
        }


class AttemptEnd(Attempt):
    endTime: datetime
    complete: bool
    failReason: Optional[str] = None

    class Config:
        schema_extra = {
            "example": {
                "attemptId": "<machine>-<uuid>",
                "endTime": "2021-07-10T21:28:51.860777",
                "complete": True,
            }
        }
