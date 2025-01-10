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
  Filler
} from "chart.js";
import moment from "moment";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const ComparisonChartDisplay = ({ 
    data=[], 
    title, 
    predictedData = [], 
    limit = 72
}) => {
    if (!data.length && !predictedData.length) {
      return <p>No data available for comparison</p>;
    }
    console.log(data, predictedData)

    // 先排序各自資料
    const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const sortedPred = [...predictedData].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // 擷取最近 limit 筆
    const limitedData = sortedData.slice(Math.max(sortedData.length - limit, 0));
    const limitedPred = sortedPred.slice(Math.max(sortedPred.length - limit, 0));

    // 合併 timestamps 供 X 軸顯示
    const allTimestamps = [
      ...limitedData.map((item) => item.timestamp),
      ...limitedPred.map((item) => item.timestamp),
    ];

    const uniqueTimestamps = Array.from(new Set(allTimestamps)).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    // 建立 chartData 的兩條線
    // (先以一條線)
    const realLine = {
        label: "Real Temperature",
        data: uniqueTimestamps.map((t) => {
            const match = limitedData.find((d) => d.timestamp === t);
            return match ? parseFloat(match.temperature) : null;
        }),
        borderColor: "rgba(255, 0, 0, 1)", // red
        fill: false
    }

    const predLine = {
        label: "Predicted Temerature",
        data: uniqueTimestamps.map((t) => {
            const match = limitedPred.find((d) => d.timestamp === t);
            return match? parseFloat(match.temperature): null;
        }),
        borderColor: "rgba(255, 0, 0, 1)", //red
        borderDash: [5, 5], //虛線
        fill: false 
    };

    const chartData = {
        labels: uniqueTimestamps.map((t) => moment(t).format("YYYY-MM-DD HH:mm")),
        datasets: [realLine, predLine]
    };

    return (
        <div style={{ width: "100%", height: "400px", marginTop: "30px" }}>
            <h3>{title}</h3>
            <Line
              data={chartData}
              options={{
                maintainAspectRatio: false,
                response: true,
                scales: {
                    x: {
                        title: { display: true, text: "Timestamp" },
                    },
                    y: {
                        title: { display: true, text: "Timestamp (°C)"},
                        beginAtZero: true
                    }
                }
              }}
            />
        </div>
    );
};

export default ComparisonChartDisplay;
