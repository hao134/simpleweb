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
import moment from "moment";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const ChartDisplay = ({ data }) => {
    if (!data.length) {
      return <p>No data available for the selected criteria.</p>;
    }

    // Generate chart data
    const timestamps = Array.from(
      new Set(data.map((item) => item.timestamp))
    ).sort((a, b) => new Date(a) - new Date(b));

    const warehouses = Array.from(new Set(data.map((item) => item.location)));

    const predefinedColors = [
      "rgba(255, 0, 0, 1)", // red
      "rgba(0, 255, 0, 1)", // green
      "rgba(0, 0, 255, 1)", // blue
      "rgba(255, 165, 0, 1)", // orange
      "rgba(128, 0, 128, 1)", // purple
      "rgba(255, 255, 0, 1)", // yellow
    ];

    const datasets = warehouses.map((warehouse, index) => ({
      label: warehouse,
      data: timestamps.map((timestamp) => {
        const match = data.find(
          (item) => item.location === warehouse && item.timestamp === timestamp 
        );
        return match ? parseFloat(match.temperature) : null;
      }),
      borderColor: predefinedColors[index % predefinedColors.length], // 從預定義顏色中選擇
      spanGaps: true, // 啟用 gap 自動連接
    }));

    const chartData = {
      labels: timestamps.map((timestamp) => 
        moment(timestamp).format("YYYY-MM-DD HH:mm")
      ),
      datasets,
    };

    return (
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
    );
  };
  
  export default ChartDisplay;
  