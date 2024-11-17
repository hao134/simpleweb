import { response } from "express";
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

function App() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  // 從環境變量中讀取 API基礎 URL
  //const API_BASE_URL = `http://${process.env.REACT_APP_PUBLIC_IP}:3000/api/temperature_data`;
  const API_BASE_URL = "https://98.84.242.113/api/temperature_data";
  // test
  //console.log("Environment Variable:", process.env.REACT_APP_PUBLIC_IP);

  useEffect(() => {
    fetch(API_BASE_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setData(data))
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(error.message);
      });
  }, [API_BASE_URL]);

  //準備 Chart.js 數據
  const chartData = {
    labels: data.map((item) => item.timestamp), // X軸標籤：時間戳
    datasets: [
      {
        label: "Temperature (°C)", // 數據集標籤
        data: data.map((item) => item.temperature), // Y軸數據：溫度
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 1,
      }
    ]
  }

  // Chart.js的配置選項
  const chartOptions = {
    responsive: true,
    plugins:{
      legend:{
        display: true,
        position: "top",
      },
    },
    scales:{
      x: {
        title: {
          display: true,
          text: "Timestamp",
        },
      },
      y: {
        title: {
          display: true,
          text: "Temperature (°C)",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      <h1>Temperature Data Visulization</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {data.length > 0 ? (
        <Line data={chartData} options={chartOptions} />
      ) : (
        <p>Loading data or no records found...</p>
      )}
    </div>
  );
}

export default App;
