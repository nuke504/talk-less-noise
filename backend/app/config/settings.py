from pydantic import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    API_PREFIX: str = "/api"
    PROJECT_NAME: str = "Let’s talk less noise"

    DB_USERNAME: str = "devapp"
    DB_PASSWORD: str = "a8gJHqaiaGh7oC6g"

    SERVER_NAME: str = "dev"
    LOGGING_DIR: str = "/Users/starlight/Desktop/talk_less_noise/backend/app/logs"

    TEST_VALUE: int = 101011


class SurveySettings(BaseSettings):
    AREAS: List[str] = [
        "sembawang",
        "woodlands",
        "yishun",
        "angMoKio",
        "hougang",
        "punggol",
        "sengkang",
        "serangoon",
        "bedok",
        "pasirRis",
        "tampines",
        "bukitBatok",
        "bukitPanjang",
        "choaChuKang",
        "clementi",
        "jurongEast",
        "jurongWest",
        "tengah",
        "bishan",
        "bukitMerah",
        "bukitTimah",
        "centralBusinessDistrict",
        "geylang",
        "whampoa",
        "kallang",
        "marineParade",
        "queenstown",
        "toaPayoh",
    ]

    NOISE_CATEGORIES: List[str] = [
        "pets",
        "furniture",
        "baby",
        "works",
        "music",
        "others",
    ]

    GROUP_BY_COLUMN_TYPE = Optional[List[str]]


survey_settings = SurveySettings()
settings = Settings()
