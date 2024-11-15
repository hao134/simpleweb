import os
import json
import logging
from pymongo import MongoClient
from datetime import datetime

# 設置日誌
logging.basicConfig(filename="data_insertion.log", level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")

# 讀取 MongoDB URI
mongodb_uri = os.getenv("MONGODB_URI")
client = MongoClient(mongodb_uri)

def is_valid_record(record):
    try:
        datetime.fromisoformat(record["timestamp"].replace("Z", "+00:00"))
    except ValueError:
        logging.error("Invalid timestamp: %s", record["timestamp"])
        return False

    if not record.get("location"):
        logging.error("Missing or empty location")
        return False

    if not isinstance(record.get("temperature"), (int, float)) or not (-50 <= record["temperature"] <= 100):
        logging.error("Invalid temperature: %s", record["temperature"])
        return False

    return True

try:
    db = client["sensor_data_db"]
    collection = db["temperature_data"]
    logging.info("Connected to Database")

    with open("temperature_data.json", "r") as file:
        data = json.load(file)
        for record in data:
            if is_valid_record(record):
                collection.insert_one(record)
                logging.info("Inserted record: %s", record)
            else:
                logging.warning("Invalid record, skipping: %s", record)
except Exception as e:
    logging.critical("Database operation failed: %s", e)
finally:
    client.close()
