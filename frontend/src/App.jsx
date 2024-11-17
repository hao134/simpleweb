import React, { useEffect, useState } from "react";
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
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE_URL = "https://98.84.242.113/api/temperature_data";

  useEffect(() => {
    fetch(API_BASE_URL)
      .then((response) => response.json())
      .then((data) => {
        // 數據處理
        const labels = data.map((item) => item.timestamp);
        console.log(data);
        const temperatures = data.map((item) => item.temperature);
        setChartData({
          labels,
          datasets: [
            {
              label: "Temperature",
              data: temperatures,
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(error.message);
      });
  }, []);

  if (error) {
    return <p style={{ color: "red" }}>Error: {error}</p>;
  }

  return (
    <div>
      <h1>Temperature Data Visualization</h1>
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
          }}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;
