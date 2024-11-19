import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
//import moment from "moment"; // 引入 moment.js

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [data, setData] = useState([])
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState("All");
  const [dateRange, setDateRange] = useState({start: "", end: "" })

  const API_BASE_URL = "https://98.84.242.113/api/temperature_data";

  useEffect(() => {
    fetch(API_BASE_URL)
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(error.message);
      });
  }, []);

  // 根據篩選條件更新圖表數據
  useEffect(() => {
    const filteredData = data.filter((item) => {
      const date = new Date(item.timestamp);
      const inDateRange = 
        (!dateRange.start || date >= new Date(dateRange.start)) &&
        (!dateRange.end || date <= new Date(dateRange.end));
      const matchesWarehouse = 
        selectedWarehouse === "All" || item.location === selectedWarehouse
      return inDateRange && matchesWarehouse 
    });
    console.log("Filtered Data:", filteredData);


    const warehouses = Array.from(new Set(filteredData.map((item) => item.location)));

    const datasets = warehouses.map((warehouse) => ({
      label: warehouse,
      data: filteredData
        .filter((item) => item.location === warehouse)
        .map((item) => parseFloat(item.temerature)), //確保溫度為數字
      borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
      )}, ${Math.floor(Math.random() * 255)}, 1)`, //隨機顏色
    }));

    setChartData({
      labels: filteredData.map((item) =>
        //moment(item.timestamp).format("YYYY-MM-DD HH:mm")
      new Date(item.timestamp).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      ), //格式化日期顯示
      datasets,
    });
  }, [data, selectedWarehouse, dateRange]);

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value })
  }

  const handleWarehouseChange = (e) => {
    setSelectedWarehouse(e.target.value);
  };
  if (error) {
    return <p style={{ color: "red" }}>Error: {error}</p>;
  }

  return (
    <div>
      <h1>Temperature Data Visualization</h1>

      {/* 篩選條件 */}
      <div>
        <label>
          Start Date:
          <input 
            type="date"
            name="start"
            value={dateRange.start}
            onChange={handleDateChange}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            name="end"
            value={dateRange.end}
            onChange={handleDateChange}
          />
        </label>
        <label>
          Warehouse:
          <select value={selectedWarehouse} onChange={handleWarehouseChange}>
            <option value="All">All</option>
            {[...new Set(data.map((item) => item.location))].map((warehouse) => (
              <option key={warehouse} value={warehouse}>
                {warehouse}
              </option>
            ))}

          </select>
        </label>
      </div>
      {/* 圖表 */}
      {chartData ? (
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: true,
                position: "top",
              },
            },
            scales: {
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
          }}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;
