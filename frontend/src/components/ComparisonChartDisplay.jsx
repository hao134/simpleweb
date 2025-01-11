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
    backReal = 90,
    backPred = 60,
    fwdPred = 30
}) => {
    if (!data.length && !predictedData.length) {
      return <p>No data available for comparison</p>;
    }

    // 先排序各自資料
    const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const sortedPred = [...predictedData].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // 找出「預測資料的最後一筆」時間；若沒有預測資料就直接用整個data
    const lastPredIndex = sortedPred.length - 1;
    if (lastPredIndex < 0) {
        // 沒預測資料就全顯示data
        // 也可直接 return 顯示單線
        return <p>No predicted data available for comparison</p>
    }

    const lastPredTimestamp = sortedPred[lastPredIndex].timestamp;

    // 在「預測資料」裡，找出最後一筆的索引 -> 只留 [lastPredIndex - backPred, lastPredIndex + fwdPred]
    const predStartIndex = Math.max(lastPredIndex - backPred, 0);                     //往前60筆
    const predEndIndex = Math.min(lastPredIndex + fwdPred, sortedPred.length - 1);    // 往後30筆

    const limitedPred = sortedPred.slice(predStartIndex, predEndIndex + 1);

    // 在「過去資料」裡，找出這個 lastPastTimestamp 所對應的索引
    // 找出第一個timestamp >= lastPastTimestamp的位置
    let pastLastIndex = sortedData.findIndex(d => new Date(d.timestamp) >= new Date(lastPredTimestamp));
    if (pastLastIndex < 0) {
        // 表示整個 data 的 timestamp 都筆 lastPredTimestamp 小，則可直接用最後一筆當作 pastLastIndex
        pastLastIndex = sortedData.length -1;
    }
    // 過去資料往前90筆
    const pastStartIndex = Math.max(pastLastIndex - backReal, 0);
    const limitedData = sortedData.slice(pastStartIndex, pastLastIndex + 1);

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
        label: "Past Temperature",
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
