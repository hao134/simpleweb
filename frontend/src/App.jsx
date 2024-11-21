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
import moment from "moment"; // 引入 moment.js
import ChartDisplay from "./components/ChartDisplay";
import FilterControls from "./components/FilterControls";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const App = () => {
  const [data, setData] = useState([]);
  const [allChartData, setAllChartData] = useState(null); // 用於整合圖表
  const [singleChartData, setSingleChartData] = useState(null); // 用於單倉庫篩選圖表
  const [error, setError] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState("All");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

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

  // 上方圖表：所有倉庫數據整合
  useEffect(() => {
    const allTimestamps = Array.from(new Set(data.map((item) => item.timestamp)))
      .sort((a, b) => new Date(a) - new Date(b)); // 確保統一時間軸

    const warehouses = Array.from(new Set(data.map((item) => item.location)));

    const datasets = warehouses.map((warehouse) => ({
      label: warehouse,
      data: allTimestamps.map((timestamp) => {
        const match = data.find(
          (item) => item.location === warehouse && item.timestamp === timestamp
        );
        return match ? parseFloat(match.temperature) : null; // 填充數據或 null
      }),
      borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
      )}, ${Math.floor(Math.random() * 255)}, 1)`, // 隨機顏色
    }));

    setAllChartData({
      labels: allTimestamps.map((timestamp) =>
        moment(timestamp).format("YYYY-MM-DD HH:mm")
      ),
      datasets,
    });
  }, [data]);

  // 下方圖表：單倉庫篩選
  useEffect(() => {
    const filteredData = data.filter((item) => {
      const date = new Date(item.timestamp);
      const inDateRange =
        (!dateRange.start || date >= new Date(dateRange.start)) &&
        (!dateRange.end || date <= new Date(dateRange.end));
      const matchesWarehouse =
        selectedWarehouse === "All" || item.location === selectedWarehouse;
      return inDateRange && matchesWarehouse;
    });

    const filteredTimestamps = Array.from(
      new Set(filteredData.map((item) => item.timestamp))
    ).sort((a, b) => new Date(a) - new Date(b));

    const singleDataset = filteredTimestamps.map((timestamp) => {
      const match = filteredData.find((item) => item.timestamp === timestamp);
      return match ? parseFloat(match.temperature) : null;
    });

    setSingleChartData({
      labels: filteredTimestamps.map((timestamp) =>
        moment(timestamp).format("YYYY-MM-DD HH:mm")
      ),
      datasets: [
        {
          label: selectedWarehouse === "All" ? "All Warehouses" : selectedWarehouse,
          data: singleDataset,
          borderColor: "rgba(75, 192, 192, 1)",
        },
      ],
    });
  }, [data, selectedWarehouse, dateRange]);

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const handleWarehouseChange = (e) => {
    setSelectedWarehouse(e.target.value);
  };

  if (error) {
    return <p style={{ color: "red" }}>Error: {error}</p>;
  }
  
  const warehouses = Array.from(new Set(data.map((item) => item.location)))
  return (
    <div>
      <h1>Temperature Data Visualization</h1>

      {/* 篩選條件 */}
      <FilterControls
        dateRange={dateRange}
        handleDateChange={handleDateChange}
        selectedWarehouse={selectedWarehouse}
        handleWarehouseChange={handleWarehouseChange}
        warehouses={warehouses}
      />

      {/* 上方圖表 */}
      <ChartDisplay title="All Warehouses" chartData={allChartData} />

      {/* 下方圖表 */}
      {singleChartData ? (
        <div>
          <h2>
            {selectedWarehouse === "All"
              ? "Filtered Data for All Warehouses"
              : `Filtered Data for ${selectedWarehouse}`}
          </h2>
          <Line
            data={singleChartData}
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
        </div>
      ) : (
        <p>Loading filtered warehouse data...</p>
      )}
    </div>
  );
}

export default App;
