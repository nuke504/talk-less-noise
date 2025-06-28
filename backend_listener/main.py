import logging
import os
import time
from datetime import datetime, timezone
from typing import List, Dict, Any
from azure.eventgrid import EventGridPublisherClient
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from pymongo import MongoClient

logging.basicConfig(level=logging.INFO)


class CosmosEventProcessor:
    """
    Handles reading from Cosmos DB MongoDB API and publishing events to Event Grid
    """

    def __init__(self):
        # Key Vault setup
        self.key_vault_url = os.environ.get("KEY_VAULT_URL")
        if not self.key_vault_url:
            raise ValueError(
                "KEY_VAULT_URL environment variable is required for Key Vault access"
            )
        self.credential = DefaultAzureCredential()
        self.secret_client = SecretClient(
            vault_url=self.key_vault_url, credential=self.credential
        )

        # Fetch DB connection components from Key Vault
        self.db_username = self._get_secret("DB-USERNAME")
        self.db_password = self._get_secret("DB-PASSWORD")
        self.db_host = self._get_secret("DB-HOST")
        self.db_port = self._get_secret("DB-PORT")
        self.cosmos_database = os.environ.get("COSMOS_DATABASE", "usageStats")
        self.cosmos_collection = os.environ.get("COSMOS_COLLECTION", "journeyMap")
        self.event_grid_endpoint = os.environ.get("EVENT_GRID_TOPIC_ENDPOINT")
        self.cosmos_connection_string = f"mongodb://{self.db_username}:{self.db_password}@{self.db_host}:{self.db_port}/"
        self._mongo_client = None
        self._event_grid_client = None
        self.logger = logging.getLogger()

    def _get_secret(self, secret_name: str) -> str:
        try:
            secret = self.secret_client.get_secret(secret_name)
            return secret.value
        except Exception as e:
            self.logger.error(
                f"Failed to retrieve secret '{secret_name}' from Key Vault: {str(e)}"
            )
            raise

    def _get_mongo_client(self) -> MongoClient:
        if not self._mongo_client:
            try:
                connection_options = {
                    "maxPoolSize": 10,
                    "minPoolSize": 1,
                    "maxIdleTimeMS": 120000,
                    "connectTimeoutMS": 30000,
                    "socketTimeoutMS": 30000,
                    "serverSelectionTimeoutMS": 30000,
                    "retryWrites": False,
                    "ssl": True,
                    "replicaSet": "globaldb",
                }
                self._mongo_client = MongoClient(
                    self.cosmos_connection_string, **connection_options
                )
                self._mongo_client.admin.command("ping")
                self.logger.info("Successfully connected to Cosmos DB")
            except Exception as e:
                self.logger.error(f"Failed to connect to Cosmos DB: {str(e)}")
                raise
        return self._mongo_client

    def _get_event_grid_client(self) -> EventGridPublisherClient:
        if not self._event_grid_client:
            try:
                if not self.event_grid_endpoint:
                    raise ValueError(
                        "EVENT_GRID_TOPIC_ENDPOINT environment variable is required"
                    )
                credential = DefaultAzureCredential()
                self._event_grid_client = EventGridPublisherClient(
                    self.event_grid_endpoint, credential
                )
                self.logger.info(
                    "Using DefaultAzureCredential for Event Grid authentication"
                )
            except Exception as e:
                self.logger.error(f"Failed to initialize Event Grid client: {str(e)}")
                raise
        return self._event_grid_client

    def publish_to_event_grid(
        self,
        event_data_list: List[Dict[str, Any]],
        event_type: str,
    ) -> None:
        try:
            if not event_data_list:
                self.logger.info("No data to publish to Event Grid")
                return
            client = self._get_event_grid_client()
            events = []
            for data in event_data_list:
                event = {
                    "subject": f"journey/{data.get('lastCheckpoint', 'start')}",
                    "eventType": event_type,
                    "eventTime": datetime.now(timezone.utc).isoformat(),
                    "id": f"{data.get('attemptId', 'unknown')}-{datetime.now(timezone.utc).isoformat()}",
                    "data": data,
                    "dataVersion": "1.0",
                }
                events.append(event)
            batch_size = 10
            for i in range(0, len(events), batch_size):
                batch = events[i : i + batch_size]
                client.send(batch)
                self.logger.info(
                    f"Published batch of {len(batch)} events to Event Grid"
                )
            self.logger.info(
                f"Successfully published {len(events)} events to Event Grid"
            )
        except Exception as e:
            self.logger.error(f"Failed to publish events to Event Grid: {str(e)}")
            raise


def format_event_time(dt):
    if isinstance(dt, dict) and "$date" in dt:
        return datetime.fromtimestamp(dt["$date"] / 1000, tz=timezone.utc).isoformat()
    elif isinstance(dt, int):
        return datetime.fromtimestamp(dt / 1000, tz=timezone.utc).isoformat()
    elif isinstance(dt, datetime):
        return dt.astimezone(timezone.utc).isoformat()
    return None


def emit_journey_events(processor, change):
    doc = change.get("fullDocument")
    if not doc:
        return

    # Get the last checkpoint and its start time
    last_checkpoint = None
    last_checkpoint_start = None
    last_checkpoint_end = None
    checkpoints = doc.get("checkpoints", [])
    if not checkpoints:
        # This is a start attempt
        event_data = {
            "attemptId": doc.get("attemptId"),
            "attemptStartTime": format_event_time(doc.get("startTime")),
        }
        processor.publish_to_event_grid([event_data], event_type="Journey.Start")
    else:
        last_checkpoint = checkpoints[-1]
        last_checkpoint_start = last_checkpoint.get("start")
        last_checkpoint_end = last_checkpoint.get("end")
        attempt_end_time = doc.get("endTime")
        if not attempt_end_time:
            # If no end time, this is an ongoing attempt
            event_data = {
                "attemptId": doc.get("attemptId"),
                "attemptStartTime": format_event_time(doc.get("startTime")),
                "lastCheckpoint": (
                    last_checkpoint.get("description") if last_checkpoint else None
                ),
                "lastCheckpointStart": (
                    format_event_time(last_checkpoint_start) if last_checkpoint_start else None
                ),
                "lastCheckpointEnd": (
                    format_event_time(last_checkpoint_end) if last_checkpoint_end else None
                ),
            }
            processor.publish_to_event_grid([event_data], event_type="Journey.Update")
        else:
            event_data = {
                "attemptId": doc.get("attemptId"),
                "attemptStartTime": format_event_time(doc.get("startTime")),
                "attemptEndTime": format_event_time(doc.get("endTime")),
            }
            processor.publish_to_event_grid([event_data], event_type="Journey.End")


def listen_changes(processor):
    logging.info("Change stream listener running.")
    while True:
        try:
            client = processor._get_mongo_client()
            db = client[processor.cosmos_database]
            collection = db[processor.cosmos_collection]
            pipeline = [
                {"$match": {"operationType": {"$in": ["insert", "update", "replace"]}}},
                {"$project": {"fullDocument": 1}},
            ]
            with collection.watch(
                pipeline=pipeline, full_document="updateLookup"
            ) as stream:
                for change in stream:
                    emit_journey_events(processor, change)
        except Exception as e:
            logging.error(f"Change stream listener error: {str(e)}. Retrying in 10s...")
            time.sleep(10)


def main():
    logging.info("Starting Cosmos DB change stream listener job...")
    processor = CosmosEventProcessor()
    listen_changes(processor)


if __name__ == "__main__":
    main()
