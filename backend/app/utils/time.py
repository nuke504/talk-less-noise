import pytz

from datetime import datetime


def convert_to_local(time: datetime):
    local_tz = pytz.timezone("Asia/Singapore")
    return time.astimezone(local_tz)
