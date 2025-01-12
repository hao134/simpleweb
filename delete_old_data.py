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
        "temperature_realdata",
        "future_temperature_realdata"
    ]

    # 計算 3 天前的時間 (以本地時間)
    cutoff_time = datetime.now() - timedelta(days = 3)

    for col_name in collections_to_clean:
        collection = db[col_name]

        # 一次撈取該 collection 所有文件
        docs = list(collection.find({}))

        # 收集準備要刪除的 _id
        ids_to_delete = []

        for doc in docs:
            ts_str = doc.get("timestamp") # 例如 "2024-11-30T07:25:01.987552Z"
            if ts_str:
                try:
                    # 去掉尾巴的 'Z' 再做 fromisoformat, 或視情況而定
                    ts_clean = ts_str.replace("Z", "")
                    ts_date = datetime.fromisoformat(ts_clean)

                    if ts_date < cutoff_time:
                        ids_to_delete.append(doc["_id"])
                except ValueError:
                    # 如果無法解析 timestamp，記個 log 或直接跳過
                    logging.warning(f"[{col_name}] Could not parse timestamp: {ts_str}")
            else:
                # 若沒有 timestamp 欄位，也可以略過或視需求處理
                pass
        # 執行刪除
        if ids_to_delete:
            result = collection.delete_many({"_id":{"$in": ids_to_delete}})
            logging.info(f"[{col_name}] Deleted {result.deleted_count} documents older than 3 days.")
            print(f"[{col_name}] Deleted {result.deleted_count} documents older than 3 days.")
        else:
            logging.info(f"[{col_name}] No documents older than 3 days found.")
            print(f"[{col_name}] No documents older than 3 days found.")

except Exception as e:
    logging.critical("Failed to delete data: %s", e)
finally:
    client.close()
