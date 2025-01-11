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
    backPast = 90,
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
    const lastPastIndex = sortedData.length - 1;
    const lastPastTime = sortedData[lastPastIndex].timestamp;

    // 過去資料：只取[lastPastIndex - backPast + 1, last]
    // (代表最後一筆往前90筆)
    const pastStartIndex = Math.max(lastPastIndex - backPast + 1, 0);
    const limitedData = sortedData.slice(pastStartIndex, lastPastIndex + 1);

    // 預測資料：先找「最接近lastPastTime」的索引=> 之後往前60/往後30
    let predCenterIndex = sortedPred.findIndex(
        (item) => new Date(item.timestamp) >= new Date(lastPastTime)
    )

    // 如果找不到(代表預測資料全部都在lastPastTime之前)，就用最後一筆
    if (predCenterIndex < 0) {
        predCenterIndex = sortedPred.length -1;
    }
    // 以predCenterIndex 為中心 => 往前 60筆， 往後30筆
    const predStartIndex = Math.max(predCenterIndex - backPred, 0);
    const predEndIndex = Math.min(predCenterIndex + fwdPred, sortedPred.length -1);
    const limitedPred = sortedPred.slice(predStartIndex, predEndIndex + 1);

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
    const pastLine = {
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
        datasets: [pastLine, predLine]
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
