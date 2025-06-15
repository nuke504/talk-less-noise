import logging
import os
import time
import sys

from autologging import TRACE
from ..config.settings import DEPLOYMENT_ENV


def init_logging(log_dir: str):

    LOG_FORMAT = "%(asctime)s - %(levelname)s : %(name)s : %(funcName)s : %(message)s"

    if DEPLOYMENT_ENV == "production":
        logging.basicConfig(
            level=TRACE,
            stream=sys.stdout,
            format=LOG_FORMAT,
        )
    else:
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)

        logging.basicConfig(
            level=TRACE,
            filename=os.path.join(
                log_dir, f'api-{time.strftime("%d-%m-%Y--%H-%M-%S")}.log'
            ),
            encoding="utf-8",
            format=LOG_FORMAT,
        )
