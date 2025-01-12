import os
import logging
from pymongo import MongoClient
from datetime import datetime, timedelta

# 設置日誌
logging.basicConfig(filename="delete_data.log", level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")

# 讀取 MongoDB URI
mongodb_uri = os.getenv("MONGODB_URI")
client = MongoClient(mongodb_uri)

try:
    db = client["sensor_data_db"]
    logging.info("Connected to Database")

    # 列出所有要處理的 collection 名稱
    collections_to_clean = [
        "temperature_data",
        "future_temperature_data",
        "temperature_realdata"
        "future_temperature_realdata"
    ]

    # 計算 3 天前的時間 (以本地時間)
    cutoff_time = datetime.now() - timedelta(days = 3)

    for col_name in collections_to_clean:
        collection = db[col_name]

        # 執行刪除
        result = collection.delete_many({
            "timestamp" : {"$lt": cutoff_time}
        })
        logging.info(f"[{col_name}] Deleted {result.deleted_count} documents older 3 days.")
        print(f"[{col_name}] Deleted {result.deleted_count} documents older than 3 days")

except Exception as e:
    logging.critical("Failed to delete data: %s", e)
finally:
    client.close()
