import logging
import os

from autologging import TRACE


def init_logging(log_dir: str):

    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    logging.basicConfig(
        level=TRACE,
        filename=os.path.join(log_dir, "api_log.log"),
        encoding="utf-8",
        format="%(asctime)s - %(levelname)s : %(name)s : %(funcName)s : %(message)s",
    )
