import os
import logging
import requests
import azure.functions as func
from datetime import datetime, timezone, timedelta

# This function is triggered by messages in the Azure Queue Storage
# It sends the message content to a Discord channel via webhook

def fmt_time(t):
    try:
        dt = datetime.fromisoformat(t.replace("Z", "+00:00"))
        dt = dt.astimezone(timezone(timedelta(hours=8)))
        return dt.strftime("%Y-%m-%d %H:%M")
    except Exception:
        return t or "-"

def format_message(message: dict, event_type: str) -> str:
    """
    Formats the message to be sent to Discord.
    """
    if event_type == "Journey.Start":
        return (
            "==== New Survey Attempt ====\n"
            f"ID: {message.get('attemptId', '-')}\n"
            f"Start Time: {fmt_time(message.get('attemptStartTime', '-'))}"
        )

    if event_type == "Journey.End":
        return (
            "==== Survey Attempt Ended ====\n"
            f"ID: {message.get('attemptId', '-')}\n"
            f"Start Time: {fmt_time(message.get('attemptStartTime', '-'))}\n"
            f"End Time: {fmt_time(message.get('attemptEndTime', '-'))}"
        )

    # For Journey.Update
    if event_type != "Journey.Update":
        logging.warning(f"Unknown event type: {event_type}")
        return f"Unknown event type: {event_type}"

    attempt_id = message.get("attemptId", "-")
    start_time = message.get("attemptStartTime", "-")
    last_checkpoint = message.get("lastCheckpoint", "-")
    last_checkpoint_start = message.get("lastCheckpointStart", "-")
    last_checkpoint_end = message.get("lastCheckpointEnd", "-")

    return (
        "==== New Survey Attempt Update ====\n"
        f"ID: {attempt_id}\n"
        f"Start Time: {fmt_time(start_time)}\n"
        f"Latest checkpoint: {last_checkpoint}\n"
        f"Latest checkpoint start: {fmt_time(last_checkpoint_start)}\n"
        f"Latest checkpoint end: {fmt_time(last_checkpoint_end)}"
    )

def main(msg: func.QueueMessage) -> None:
    logging.info('Python queue trigger function processed a queue item.')
    message = msg.get_body().decode('utf-8')
    webhook_url = os.environ.get('DISCORD_WEBHOOK_URL')
    if not webhook_url:
        logging.error('DISCORD_WEBHOOK_URL is not set.')
        return
    try:
        import json
        data = json.loads(message)
        content = format_message(data["data"], data["eventType"])
    except Exception as e:
        logging.error(f'Failed to parse message: {e}')
        content = f"Queue message: {message}"
    payload = {"content": content}
    try:
        response = requests.post(webhook_url, json=payload)
        if response.status_code == 204:
            logging.info('Notification sent to Discord successfully.')
        else:
            logging.error(f'Failed to send notification to Discord: {response.status_code} {response.text}')
    except Exception as e:
        logging.error(f'Exception sending to Discord: {e}')
