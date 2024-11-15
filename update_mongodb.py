import os
import json
from pymongo import MongoClient
from datetime import datetime

# 讀取 MongoDB URI
mongodb_uri = os.getenv("MONGODB_URI")
client = MongoClient(mongodb_uri)

def is_valid_record(record):
    # 檢查 timestamp 是否為有效日期
    try:
        datetime.fromisoformat(record["timestamp"].replace("Z", "+00:00"))
    except ValueError:
        print("Invalid timestamp:", record["timestamp"])
        return False

    # 檢查 location 是否存在且非空
    if not record.get("location"):
        print("Missing or empty location")
        return False

    # 檢查 temperature 是否為數字，且在合理範圍內
    if not isinstance(record.get("temperature"), (int, float)) or not (-50 <= record["temperature"] <= 100):
        print("Invalid temperature:", record["temperature"])
        return False

    return True

try:
    # 連接到資料庫並指定集合名稱
    db = client["sensor_data_db"]
    collection = db["temperature_data"]
    print("Connected to Database")

    # 讀取並驗證 JSON 文件中的數據
    with open("temperature_data.json", "r") as file:
        data = json.load(file)
        for record in data:
            if is_valid_record(record):
                collection.insert_one(record)
                print("Inserted record:", record)
            else:
                print("Invalid record, skipping:", record)
except Exception as e:
    print("Database operation failed:", e)
finally:
    client.close()
