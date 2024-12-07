import pandas as pd
from prophet import Prophet
from pymongo import MongoClient
import os
import json

def get_data_from_mongodb():
    """從MongoDB獲取完整數據"""
    client = MongoClient(os.getenv("MONGODB_URI"))
    db = client["sensor_data_db"]
    collection = db["temperature_data"]
    data = list(collection.find({}, {"_id": 0, "location": 1, "timestamp": 1, "temperature": 1}))
    return data

def predict_temperature(data, periods = 5, freq = "H"):
    """使用 Prophet 預測未來數據"""
    df = pd.DataFrame(data)
    #將timestamp轉換為datetime格式
    df["timestamp"] = pd.to_datetime(df["timestamp"], format="mixed", errors = "coerce")
    if df["timestamp"].isnull().any():
        raise ValueError("Some timestamps could not be parsed. Please check your data.")
    
    # 去除時區資訊
    df["timestamp"] = df["timestamp"].dt.tz_localize(None)

    df = df.rename(columns={"timestamp": "ds", "temperature": "y"})

    model = Prophet()
    model.fit(df)

    future = model.make_future_dataframe(periods=periods, freq=freq)
    forecast = model.predict(future)

    future_forecast = forecast.iloc[-periods:][["ds", "yhat"]]
    return future_forecast.to_dict(orient="records")

if __name__ == "__main__":
    # 從 MongoDB獲取數據
    raw_data = get_data_from_mongodb()
    print(raw_data)

    # 分倉庫進行預測
    warehouses =set(item["location"] for item in raw_data)
    predictions = []

    for warehouse in warehouses:
        warehouse_data = [
            {"timestamp": item["timestamp"], "temperature" : item["temperature"]}
            for item in raw_data
            if item["location"] == warehouse
        ]
        future_data = predict_temperature(warehouse_data)
        for item in future_data:
            item["location"] = warehouse
            # Convert Timestamp to ISO format string before dumping to JSON
            item["ds"] = item["ds"].isoformat()
        predictions.extend(future_data)

    # 保存預測數據到JSON文件
    with open("future_temperature_data.json", "w") as f:
        json.dump(predictions, f, indent=4)
    print("Future predictions saved to future_temperature_data.json.")