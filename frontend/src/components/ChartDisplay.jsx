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

const ChartDisplay = ({ data, title, futureData }) => {
    if (!data.length) {
      return <p>No data available for {title}</p>;
    }

    //Generate chart data
    const timestamps = Array.from(
      new Set(data.map((item) => item.timestamp))
    ).sort((a, b) => new Date(a) - new Date(b));

    const warehouses = Array.from(new Set(data.map((item) => item.location)));

    const predefinedColors = [
      "rgba(255, 0, 0, 1)", // red
      "rgba(0, 255, 0, 1)", // green
      "rgba(0, 0, 255, 1)", // blue
      // "rgba(255, 165, 0, 1)", // orange
      // "rgba(128, 0, 128, 1)", // purple
      // "rgba(255, 255, 0, 1)", // yellow
    ];

    const datasets = warehouses.map((warehouse, index) => {
      // 原始數據
      const historicalDataset = {
        label: `${warehouse} (Historical)`,
        data: timestamps.map((timestamp) => {
          const match = data.find(
            (item) => item.location === warehouse && item.timestamp === timestamps
          );
          return match ? parseFloat(match.temperature) : null;
        }),
        borderColor: predefinedColors[index % predefinedColors.length],
        spanGaps: true, // 啟用 gap 自動連接
        borderWidth: 2,
      };

      // 預測數據
      const predictionDataset = futureData
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

      return futureData ? [historicalDataset, predictionDataset] : [historicalDataset];
    })

    // const datasets = warehouses.map((warehouse, index) => {
    //   const historicalDataset = {
    //     label: `${warehouse} {Historical}`,
    //     data: data
    //        .filter((item) => item.location === warehouse)
    //        .map((item) => ({
    //          x: moment(item.timestamp).format("YYYY-MM-DD HH:mm"),
    //          y: item.temperature,
    //        })),
    //        borderColor: predefinedColors[index % predefinedColors.length],
    //        borderWidth: 2,
    //   };

    //   const predictionDataset = futureData
    //     ? {
    //         label: `${warehouse} (Prediction)`,
    //         data: futureData
    //           .filter((item) => item.location === warehouse)
    //           .map((item) => ({
    //             x: moment(item.timestamp).format("YYYY-MM-DD HH:mm"),
    //             y: item.temperature,
    //           })),
    //           borderColor: predefinedColors[index % predefinedColors.length],
    //           borderDash: [5, 5], //虛線樣式
    //           borderWidth: 2,
    //       }
    //     : null;
      
    //   return futureData ? [historicalDataset, predictionDataset] : [historicalDataset]; 
    // })

    // const chartData = {
    //   labels: timestamps.map((timestamp) => 
    //     moment(timestamp).format("YYYY-MM-DD HH:mm")
    //   ),
    //   datasets,
    // };

    const chartData = {
      labels: timestamps.map((timestamp) => 
        moment(timestamp).format("YYYY-MM-DD HH:mm")
      ),
      datasets,
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
                beginAtZero: true,
              },
            },
          }}
        />  
      </div>
      
    );
  };
  
  export default ChartDisplay;