# This file stores all the pydantic models for responses
from pydantic import BaseModel
from typing import List
from app.schemas import BaseResponse


class Hour(BaseModel):
    start: int
    end: int

    class Config:
        schema_extra = {"example": {"start": 23, "end": 6}}


class NoiseCollation(BaseResponse):
    noiseCategory: str

    class Config:
        schema_extra = {
            "example": {
                "attemptId": "<machine>-<uuid>",
                "area": "northeast",
                "documentTime": "2021-07-10T21:28:51.860777",
                "numFamilyMembers": 5,
                "ageGroup": "<20",
                "neighbourNoiseIsProblem": True,
                "noiseCategory": "baby",
            }
        }


class QuietHours(BaseResponse):
    hours: List[Hour]

    class Config:
        schema_extra = {
            "example": {
                "attemptId": "<machine>-<uuid>",
                "area": "northeast",
                "documentTime": "2021-07-10T21:28:51.860777",
                "numFamilyMembers": 5,
                "ageGroup": "<20",
                "neighbourNoiseIsProblem": True,
                "hours": [{"start": 23, "end": 6}, {"start": 15, "end": 18}],
            }
        }


class Threshold(NoiseCollation):
    noisyThreshold: float
    niceThreshold: float

    class Config:
        schema_extra = {
            "example": {
                "attemptId": "<machine>-<uuid>",
                "area": "northeast",
                "documentTime": "2021-07-10T21:28:51.860777",
                "numFamilyMembers": 5,
                "ageGroup": "<20",
                "neighbourNoiseIsProblem": True,
                "noiseCategory": "baby",
                "noisyThreshold": 3,
                "niceThreshold": 8,
            }
        }
