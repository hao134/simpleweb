import json
import requests
import datetime
import os

API_KEY = os.getenv("OPENWEATHER_KEY")

# 定義目標地點的地理座標
locations = [
    {
        "name": "台北",
        "latitude": 25.0330,    # 台北經度
        "longitude": 121.5654    # 台北緯度
    },
    {
        "name": "高雄",
        "latitude": 22.6273,    # 高雄緯度
        "longitude": 120.6660    # 高雄經度
    },
    {
        "name": "玉山",
        "latitude": 23.4755,    # 玉山緯度
        "longitude": 120.9170    # 玉山經度
    }
]

def fetch_real_temperature_data():
    data = []
    current_time = datetime.datetime.utcnow()

    for location in locations:
        # 構建 API 請求 URL
        url = (
            f"http://api.openweathermap.org/data/2.5/weather?"
            f"lat={location['latitude']}&lon={location['longitude']}&units=metric&appid={API_KEY}"
        )

        try:
            response = requests.get(url)
            response.raise_for_status()  # 如果請求失敗，拋出異常
            weather_data = response.json()

            temperature = weather_data["main"]["temp"]  # 溫度
            timestamp = current_time.isoformat() + "Z"  # ISO8601 格式的時間戳

            data.append({
                "location": location["name"],
                "timestamp": timestamp,
                "temperature": temperature
            })

        except requests.exceptions.HTTPError as http_err:
            print(f"HTTP error occurred for {location['name']}: {http_err}")
        except Exception as err:
            print(f"Other error occurred for {location['name']}: {err}")

    return data

if __name__ == "__main__":
    real_data = fetch_real_temperature_data()
    with open("temperature_realdata.json", "w") as f:
        json.dump(real_data, f, indent=4)
    print("Real temperature data generated and saved to temperature_realdata.json.")
