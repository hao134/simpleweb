import json
from pymongo import MongoClient
import os

# 讀取 MongoDB URI
mongodb_uri = os.getenv("MONGODB_URI")
client = MongoClient(mongodb_uri)
db = client["sensor_data_db"]
collection = db["temperature_data"]

# 讀取 JSON 文件並插入數據
with open("sales_data.json", "r") as file:
    data = json.load(file)
    for record in data:
        collection.insert_one(record)
        print("Inserted record:", record)
