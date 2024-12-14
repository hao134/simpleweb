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

const ChartDisplay = ({ data, title, futureData = [], historyLimit = 102 }) => {
    if (!data.length) {
      return <p>No data available for {title}</p>;
    }
    
    // 限制數據點到最近的個數(limit)，並確保排序
    const limitData = (data, limit) => {
      const sortedData = [...data].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
      const startIndex = Math.max(0, sortedData.length - limit);
      return sortedData.slice(startIndex, sortedData.length);
    }

    // 若是下方圖表，歷史數據限制為36個點，其他圖表則使用`historyLimit`
    const limitedData = 
      title.includes("Predictions") && historyLimit > 36
        ? limitData(data, 36)
        : limitData(data, historyLimit);

    //const limitedFutureData = futureData ? limitData(futureData, 102) : [];

    // 將歷史及未來的timestamp全部收集起來
    const allTimestamps = [
      ...limitedData.map((item) => item.timestamp),
      ...(futureData ? futureData.map((item) => item.timestamp) : [])
    ]

    const timestamps = Array.from(new Set(allTimestamps)).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    const warehouses = Array.from(
      new Set([
        ...limitedData.map((item) => item.location),
        ...(futureData
          ? futureData.map((item) => item.location)
          : []),
      ])
    );

    const predefinedColors = [
      "rgba(255, 0, 0, 1)", // red
      "rgba(0, 255, 0, 1)", // green
      "rgba(0, 0, 255, 1)", // blue
      // "rgba(255, 165, 0, 1)", // orange
      // "rgba(128, 0, 128, 1)", // purple
      // "rgba(255, 255, 0, 1)", // yellow
    ];

    const datasets = warehouses.flatMap((warehouse, index) => {
      // 原始數據
      const historicalDataset = {
        label: `${warehouse} (Historical)`,
        data: timestamps.map((timestamp) => {
          const match = data.find(
            (item) => item.location === warehouse && item.timestamp === timestamp
          );
          return match ? parseFloat(match.temperature) : null;
        }),
        borderColor: predefinedColors[index % predefinedColors.length],
        spanGaps: true, // 啟用 gap 自動連接
        borderWidth: 2,
      };

      // 預測數據主線
      const predictionDataset = futureData.length
        ? {
            label: `${warehouse} (Prediction)`,
            data: timestamps.map((timestamp) => {
              const match = futureData.find(
                (item) => item.location === warehouse && item.timestamp === timestamp
              );
              return match ? parseFloat(match.temperature) : null;
            }),
            borderColor: predefinedColors[index % predefinedColors.length],
            borderDash: [5, 5], //虛線模式
            spanGaps: true,
            borderWidth: 2,
          }
        : null;
      
      // 預測數據信賴區間下界
      const lowerBoundDataset = futureData.length
        ? {
            label: `${warehouse} (Lower Bound)`,
            data: timestamps.map((timestamp) => {
              const match = futureData.find(
                (item) => item.location === warehouse && item.timestamp === timestamp
              );
              return match ? parseFloat(match.lower_bound) : null;
            }),
            borderColor: "rgba(0, 0, 0, 0)", //隱藏線條顏色
            backgroundColor: predefinedColors[index % predefinedColors.length],
            fill: "-1",
            borderDash: [5, 5],
            borderWidth: 0,
            spanGaps: true,
            pointRadius: 0,
          }
        : null;

      // 預測數據信賴區間上界
      const upperBoundDataset = futureData.length
        ? {
            label: `${warehouse} (Upper Bound)`,
            data: timestamps.map((timestamp) =>{
              const match = futureData.find(
                (item) => item.location === warehouse && item.timestamp === timestamp
              );
              return match ? parseFloat(match.upper_bound) : null;
            }),
            borderColor: "rgba(0, 0, 0, 0)", //隱藏線條顏色
            backgroundColor: predefinedColors[index % predefinedColors.length],
            fill: "+1",
            borderDash: [5, 5],
            borderWidth: 0,
            spanGaps: true,
            pointRadius: 0,
          }
        : null;

      return futureData
        ? [historicalDataset, predictionDataset, lowerBoundDataset, upperBoundDataset] 
        : [historicalDataset];
    });


    const chartData = {
      labels: timestamps.map((timestamp) => 
        moment(timestamp).format("YYYY-MM-DD HH:mm")
      ),
      datasets: datasets.flat().filter(Boolean), //過濾掉 null
    };
      

    return (
      <div>
        <h2>{title}</h2>
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
                //beginAtZero: true,
              },
            },
          }}
        />  
      </div>
      
    );
  };
  
  export default ChartDisplay;