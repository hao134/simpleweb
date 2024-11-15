import os
import json
from pymongo import MongoClient

# 從環境變數中讀取 MongoDB URI
mongodb_uri = os.getenv("MONGODB_URI")
client = MongoClient(mongodb_uri)

try:
    # 連接到資料庫並指定集合名稱
    db = client["sensor_data_db"]
    collection = db["temparature_data"]
    print("Connected to Database")

    # 讀取並插入 JSON 文件中的數據
    with open("temparature_data.json", "r") as file:
        data = json.load(file)
        for record in data:
            collection.insert_one(record)
            print("Inserted record:", record)
except Exception as e:
    print("Database operation failed:", e)
finally:
    client.close()
