import asyncio
import numpy as np
import uuid
import pytest


from fastapi.testclient import TestClient
from datetime import datetime

from app.main import app
from app.config.settings import settings, survey_settings
from app.db.operations import delete_one, find_one, convert_to_sync

from test import assert_http_response

client = TestClient(app)


class TestJourneyMap:

    db = "usageStats"
    collection = "journeyMap"

    @assert_http_response(status_code=201, acknowledged=True)
    def start_attempt(self):
        # Post a fake new attempt to the database
        data = {
            "attemptId": self.attemptId,
            "area": np.random.choice(survey_settings.AREAS),
            "startTime": datetime.now().isoformat(),
        }
        return client.post(f"{settings.API_PREFIX}/usage/attempt/start", json=data)

    @assert_http_response(
        status_code=200, acknowledged=True, matchedCount=1, modifiedCount=1
    )
    def start_checkpoint(self, checkpoint_name: str):
        # Update with one checkpoont
        data = {
            "attemptId": self.attemptId,
            "description": checkpoint_name,
            "start": datetime.now().isoformat(),
        }
        return client.put(f"{settings.API_PREFIX}/usage/checkpoint/start", json=data)

    @assert_http_response(
        status_code=200, acknowledged=True, matchedCount=1, modifiedCount=1
    )
    def end_checkpoint(self, checkpoint_name: str):
        # Update with one checkpoont
        data = {
            "attemptId": self.attemptId,
            "description": checkpoint_name,
            "end": datetime.now().isoformat(),
        }
        return client.put(f"{settings.API_PREFIX}/usage/checkpoint/end", json=data)

    @assert_http_response(
        status_code=200, acknowledged=True, matchedCount=1, modifiedCount=1
    )
    def end_attempt(self):
        # Update with end of attempt
        data = {
            "attemptId": self.attemptId,
            "endTime": datetime.now().isoformat(),
            "complete": True,
        }
        return client.put(f"{settings.API_PREFIX}/usage/attempt/end", json=data)

    def cleanup(self):
        loop = asyncio.get_event_loop()
        response = loop.run_until_complete(
            delete_one(self.db, self.collection, {"attemptId": self.attemptId})
        )
        assert response.acknowledged
        assert response.deletedCount == 1

    @convert_to_sync
    async def find_one(self, query: dict):
        return await find_one(self.db, self.collection, query)

    @pytest.fixture
    def journey_map(self,):
        # Create unique attempt ID
        self.attemptId = f"test-{uuid.uuid1()}"
        # Create new attempt and post to DB
        self.start_attempt()
        # Start checkpoint 1
        self.start_checkpoint("test-checkpoint-1")
        # End checkpoint 1
        self.end_checkpoint("test-checkpoint-1")
        # Start checkpoint 2
        self.start_checkpoint("test-checkpoint-2")
        # End checkpoint 1
        self.end_checkpoint("test-checkpoint-2")
        # End Attempt
        self.end_attempt()

        yield self.find_one({"attemptId": self.attemptId})

        # Delete document
        self.cleanup()

    def check_data(self, data):
        assert data, "Data was not found after insertion"
        assert len(data["checkpoints"]) == 2, "There should be 2 checkpoints only"
        assert type(data["checkpoints"]) == list, "Checkpoints should be an array"
        for checkpoint in data["checkpoints"]:
            set(checkpoint.keys()) == {"start", "end", "description"}

    def test_journey_map(self, journey_map: dict):

        self.check_data(journey_map)
