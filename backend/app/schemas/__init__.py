from pydantic import BaseModel
from datetime import datetime


class Attempt(BaseModel):
    attemptId: str

    class Config:
        schema_extra = {"example": {"attemptId": "<machine>-<uuid>"}}


class BaseResponse(Attempt):
    area: str
    documentTime: datetime

    class Config:
        schema_extra = {
            "example": {
                "attemptId": "<machine>-<uuid>",
                "area": "angMoKio",
                "documentTime": "2021-07-10T21:28:51.860777",
            }
        }
