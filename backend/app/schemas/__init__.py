from pydantic import BaseModel
from datetime import datetime


class Attempt(BaseModel):
    attemptId: str

    class Config:
        schema_extra = {"example": {"attemptId": "<machine>-<uuid>"}}


class BaseResponse(Attempt):
    area: str
    documentTime: datetime
    numFamilyMembers: int
    ageGroup: str
    neighbourNoiseIsProblem: bool

    class Config:
        schema_extra = {
            "example": {
                "attemptId": "<machine>-<uuid>",
                "area": "northeast",
                "documentTime": "2021-07-10T21:28:51.860777",
                "numFamilyMembers": 5,
                "ageGroup": "<20",
                "neighbourNoiseIsProblem": True,
            }
        }
