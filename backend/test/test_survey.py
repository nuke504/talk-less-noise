import pytest
import numpy as np

from typing import List
from functools import reduce
from datetime import datetime
from fastapi.testclient import TestClient
from fastapi import Response
from bson import ObjectId
from abc import abstractmethod

from app.config.settings import survey_settings
from app.db.operations import find_one, convert_to_sync

from test import (
    assert_http_response,
    insert_delete_tests,
    delete_post,
    attempt_id,
    location,
)


def noise_category():
    return np.random.choice(survey_settings.NOISE_CATEGORIES)


def quiet_hours():
    possible_categories = [
        [{"start": 23, "end": 6}],
        [{"start": 23, "end": 6}, {"start": 16, "end": 18}],
        [{"start": 10, "end": 17}],
    ]
    random_hour = np.random.choice(possible_categories)
    new_hour_ranges = []
    for hour_range in random_hour:
        new_hour_range = {}
        new_hour_range["start"] = hour_range["start"] + max(
            min(int(np.random.normal(0, 1)), 3), -3
        )
        new_hour_range["end"] = hour_range["end"] + max(
            min(int(np.random.normal(0, 1)), 3), -3
        )
        new_hour_range["start"] = min(23, new_hour_range["start"])
        new_hour_range["end"] = min(23, new_hour_range["end"])
        new_hour_ranges.append(new_hour_range)

    return new_hour_ranges


def threshold():
    return np.random.uniform(0, 10)


class NotTested:
    class TestSurveyMethod(object):

        db = ""
        collection = ""
        get_api = ""
        post_api = ""

        @abstractmethod
        def get_test_cases(self):
            pass

        @assert_http_response(status_code=200)
        def run_get_api(self, client: TestClient, api_prefix: str):
            return client.get(api_prefix + self.get_api)

        @abstractmethod
        def post_test_case(self):
            pass

        @pytest.fixture
        @delete_post
        @assert_http_response(status_code=201, acknowledged=True)
        def run_post_api(
            self, client: TestClient, api_prefix: str, post_test_case: dict
        ):
            return client.post(api_prefix + self.post_api, json=post_test_case)

        @abstractmethod
        def test_get_api(self):
            pass

        @convert_to_sync
        async def find_one(self, query: dict):
            return await find_one(self.db, self.collection, query)

        def test_post_api(self, run_post_api: Response, post_test_case: dict):

            response = run_post_api.json()
            document = self.find_one({"_id": ObjectId(response["insertedId"])})

            for key in document:
                if key == "_id" or "time" in key.lower():
                    continue
                assert (
                    document[key] == post_test_case[key]
                ), f"{key} does not have the correct value. {document[key]} vs {post_test_case[key]}"


class TestNoiseCollation(NotTested.TestSurveyMethod):

    db = "surveyAnswers"
    collection = "noiseCollation"
    get_api = "/survey/noiseCollation?group_by_columns=noiseCategory"
    post_api = "/survey/noiseCollation"

    @pytest.fixture
    @insert_delete_tests(total=100)
    def get_test_cases(self):
        return {
            "attemptId": attempt_id(),
            "area": location(),
            "documentTime": datetime.now(),
            "noiseCategory": noise_category(),
        }

    @pytest.fixture
    def post_test_case(self):
        return {
            "attemptId": attempt_id(),
            "area": location(),
            "documentTime": datetime.now().isoformat(),
            "noiseCategory": noise_category(),
        }

    def test_get_api(
        self, get_test_cases: List[dict], client: TestClient, api_prefix: str
    ):
        response = self.run_get_api(client, api_prefix).json()

        assert len(response) > 0, "Cannot run test with no docs in database"

        for category in response:

            # Check all keys in category
            for key in ["count", "noiseCategory", "percentage"]:
                assert key in category, f"{key} does not exist in document"

            # Check percentage in range[0,100]
            assert (
                category["percentage"] <= 100 and category["percentage"] >= 0
            ), "Percentage {category['percentage']} is out of bounds"

        assert (
            reduce(lambda acc, x: acc + x["percentage"], response, 0) > 99.9999
        ), "Percentage does not add up to 100"


class TestQuietHours(NotTested.TestSurveyMethod):

    db = "surveyAnswers"
    collection = "quietHours"
    get_api = "/survey/quietHours"
    post_api = "/survey/quietHours"

    @pytest.fixture
    @insert_delete_tests(total=100)
    def get_test_cases(self):
        return {
            "attemptId": attempt_id(),
            "area": location(),
            "documentTime": datetime.now(),
            "hours": quiet_hours(),
        }

    @pytest.fixture
    def post_test_case(self):
        return {
            "attemptId": attempt_id(),
            "area": location(),
            "documentTime": datetime.now().isoformat(),
            "hours": quiet_hours(),
        }

    def test_get_api(
        self, get_test_cases: List[dict], client: TestClient, api_prefix: str
    ):
        response = self.run_get_api(client, api_prefix).json()

        assert len(response) > 0, "Cannot run test with no docs in database"

        for quiet_hour in response:

            # Check all keys in category
            for key in ["count", "quietHour"]:
                assert key in quiet_hour, f"{key} does not exist in document"
            assert (
                quiet_hour["quietHour"] <= 23 and quiet_hour["quietHour"] >= 0
            ), "Hours are not between 0 and 23"


class TestThreshold(NotTested.TestSurveyMethod):

    db = "surveyAnswers"
    collection = "threshold"
    get_api = "/survey/threshold?group_by_columns=noiseCategory"
    post_api = "/survey/threshold"

    @pytest.fixture
    @insert_delete_tests(total=100)
    def get_test_cases(self):
        return {
            "attemptId": attempt_id(),
            "area": location(),
            "documentTime": datetime.now(),
            "noiseCategory": noise_category(),
            "noisyThreshold": threshold(),
            "niceThreshold": threshold(),
        }

    @pytest.fixture
    def post_test_case(self):
        return {
            "attemptId": attempt_id(),
            "area": location(),
            "documentTime": datetime.now().isoformat(),
            "noiseCategory": noise_category(),
            "noisyThreshold": threshold(),
            "niceThreshold": threshold(),
        }

    def test_get_api(
        self, get_test_cases: List[dict], client: TestClient, api_prefix: str
    ):
        response = self.run_get_api(client, api_prefix).json()

        assert len(response) > 0, "Cannot run test with no docs in database"

        for quiet_hour in response:

            # Check all keys in documents
            for key in ["noiseCategory", "noisyThreshold", "niceThreshold"]:
                assert key in quiet_hour, f"{key} does not exist in document"
            assert (
                quiet_hour["noisyThreshold"] >= 0 and quiet_hour["niceThreshold"] >= 0
            ), "Thresholds are lower than 0"
