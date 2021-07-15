# Models for responses from django
from pydantic import BaseModel
from typing import List


class DBResponse(BaseModel):
    acknowledged: bool

    class Config:
        schema_extra = {"example": {"acknowledged": True}}


class InsertOneResponse(DBResponse):
    insertedId: str

    class Config:
        schema_extra = {
            "example": {"acknowledged": True, "insertedId": "507f1f77bcf86cd799439011"}
        }


class InsertManyResponse(DBResponse):
    insertedIds: List[str]

    class Config:
        schema_extra = {
            "example": {
                "acknowledged": True,
                "insertedIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439234"],
            }
        }


class UpdateOneResponse(DBResponse):
    matchedCount: int
    modifiedCount: int

    class Config:
        schema_extra = {
            "example": {"matchedCount": 1, "modifiedCount": 1, "acknowledged": True}
        }


class DeleteResponse(DBResponse):
    deletedCount: int

    class Config:
        schema_extra = {"example": {"deletedCount": 1, "acknowledged": True}}
