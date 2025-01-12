import { useEffect, useState } from "react";
import FilterControls from "./components/FilterControls";
import ChartDisplay from "./components/ChartDisplay";
import ComparisonChartDisplay from "./components/ComparisonChartDisplay";
import { fetchTemperatureData, fetchFuturePredictions, fetchTemperaturerData, fetchFuturerPredictions } from "./services/api";


const App = () => {
  const [data, setData] = useState([]);
  const [latestFutureData, setLatestFutureData] = useState([]);
  const [rdata, setrData] = useState([]);
  const [latestFuturerData, setLatestFururerData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filteredrData, setFilteredrData] = useState([]);
  const [futureData, setFutureData] = useState([]); //預測數據
  const [futurerData, setFuturerData] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedWarehouse, setSelectedWarehouse] = useState(["All"]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("faked")

  // Tab 切換 handle
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };
  
  // -------------------- faked data --------------------------------
  // 當初次進入時獲取歷史資料
  useEffect(() => {
    fetchTemperatureData()
      .then((fetchedData) => setData(fetchedData))
      .catch((error) => {setError(error.message);});
  }, []);

  useEffect(() => {
    fetchFuturePredictions()
      .then((predictions) => setFutureData(predictions))
      .catch((error) => {setError(error.message);});
  }, []);

  // 重新計算最新批次
  useEffect(() => {
    if(!futureData.length) {
      setLatestFutureData([]);
      return;
    }

    // 1. 先排除沒有 forecast_generated_at 的舊資料
    const validFuture = futureData.filter(d => d.forecast_generated_at);

    // 如果 validFuture 是空的，就代表舊的資料都沒 batch
    if (!validFuture.length) {
      setLatestFutureData([]);
      return;
    }
    // 1. 收集所有 forecast_generated_at
    const allBatches = [...new Set(validFuture.map(d => d.forecast_generated_at))];
    // 2. 取最後一個(最新批次)
    const latestBatch = allBatches.sort().pop();
    // 3. 過濾出該批次資料
    const filtered = validFuture.filter(d => d.forecast_generated_at === latestBatch);
    setLatestFutureData(filtered)
  }, [futureData])

  // 根據user選擇來過濾資料
  useEffect(() => {
    const filtered= data.filter((item) => {
      const date = new Date(item.timestamp);
      const inDateRange =
        (!dateRange.start || date >= new Date(dateRange.start)) &&
        (!dateRange.end || date <= new Date(dateRange.end));

      const matchesWarehouse =
        selectedWarehouse.includes("All") || 
        selectedWarehouse.includes(item.location);
      return inDateRange && matchesWarehouse;
    });
    setFilteredData(filtered)
  }, [data, dateRange, selectedWarehouse]);

  // -------------------- real data --------------------------------
  // 當初次進入時獲取歷史資料
  useEffect(() => {
    fetchTemperaturerData()
      .then((fetchedData) => setrData(fetchedData))
      .catch((error) => {setError(error.message);});
  }, []);

  useEffect(() => {
    fetchFuturerPredictions()
      .then((predictions) => setFuturerData(predictions))
      .catch((error) => {setError(error.message);});
  }, []);

  // 重新計算最新批次
  useEffect(() => {
    if(!futurerData.length) {
      setLatestFururerData([]);
      return;
    }

    const validrFuture = futurerData.filter(d=>d.forecast_generated_at);
    if (!validrFuture.length) {
      setLatestFururerData([]);
      return;
    }
    // 1.收集所有forecast_generated_at
    const allBatches = [...new Set(validrFuture.map(d => d.forecast_generated_at))];
    // 2.取最後ㄧ個(最新批次)
    const latestBatch = allBatches.sort().pop();
    // 3. 過濾出該批次資料
    const filtered = validrFuture.filter(d => d.forecast_generated_at === latestBatch);
    setLatestFururerData(filtered)
  }, [futurerData])

  // 根據user選擇來過濾資料
  useEffect(() => {
    const filtered= rdata.filter((item) => {
      const date = new Date(item.timestamp);
      const inDateRange =
        (!dateRange.start || date >= new Date(dateRange.start)) &&
        (!dateRange.end || date <= new Date(dateRange.end));

      const matchesWarehouse =
        selectedWarehouse.includes("All") || 
        selectedWarehouse.includes(item.location);
      return inDateRange && matchesWarehouse;
    });
    setFilteredrData(filtered)
  }, [rdata, dateRange, selectedWarehouse]);

  
  if (error) {
    return <p style={{ color: "red" }}>Error: {error}</p>;
  }
  
  return (
    <div className="container-fluid">
      <h1>Temperature Data Visualization</h1>
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "faked" ? "active" : ""}`}
            onClick={() => handleTabChange("faked")}
          >
            假資料(Faked)
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "real" ? "active" : ""}`}
            onClick={() => handleTabChange("real")}
          >
            真資料(Real)
          </button>
        </li>
      </ul>

      {activeTab === "faked" && (

        <div className="mt-3">
          <div className="row">
            {/* 第一張圖: 歷史資料 */}
            <div className="col-12">
              <FilterControls
                data={data}
                dateRange={dateRange}
                selectedWarehouses={selectedWarehouse}
                setDateRange={setDateRange}
                setSelectedWarehouses={setSelectedWarehouse}
              />
              <ChartDisplay
                data={filteredData} 
                title="Filtered Historical Data"
                historyLimit={102}
              />
            </div>

            {/* 第二張圖: 歷史 + 預測 */}
            <div className="col-12 mt-5">
              <ChartDisplay 
                data={data} 
                futureData={latestFutureData} 
                title="Historical + Predictions (All Warehouses)"
                historyLimit={36}  
              />
              {console.log("latestFutureData => ", latestFutureData)}
            </div>

            {/* 第三張圖(第一地點)*/}
            <div className="col-4 mt-5">
              <ComparisonChartDisplay
                title="(Faked) Comparison: W1"
                data={data.filter(d => d.location === "Warehouse 1")}
                predictedData={futureData.filter(d => d.location === "Warehouse 1")}
                backPast={30}  //真實資料往前顯示30筆
                fwdPred={10}   //預測資料往後10筆
              />
            </div>
            <div className="col-4 mt-5">
              <ComparisonChartDisplay
                title="(Faked) Comparison: W2"
                data={data.filter(d => d.location === "Warehouse 2")}
                predictedData={futureData.filter(d => d.location === "Warehouse 2")}
                backPast={30}  //真實資料往前顯示30筆
                fwdPred={10}   //預測資料往後10筆
              />
            </div>
            <div className="col-4 mt-5">
              <ComparisonChartDisplay
                title="(Faked) Comparison: W3"
                data={data.filter(d => d.location === "Warehouse 3")}
                predictedData={futureData.filter(d => d.location === "Warehouse 3")}
                backPast={30}  //真實資料往前顯示30筆
                fwdPred={10}   //預測資料往後10筆
              />
            </div>
          </div>
          
        </div>
      )}

      {activeTab === "real" && (

        <div className="mt-3">
          <div className="row">
            <div className="col-12">
              <FilterControls
                data={rdata}
                dateRange={dateRange}
                selectedWarehouses={selectedWarehouse}
                setDateRange={setDateRange}
                setSelectedWarehouses={setSelectedWarehouse}
              />
              <ChartDisplay
                data={filteredrData} 
                title="Filtered Historical Data"
                historyLimit={102}
              />
            </div>
            <div className="mt-5 col-12">
              <ChartDisplay 
                data={rdata} 
                futureData={latestFuturerData} 
                title="Historical + Predictions (All Location)"
                historyLimit={36}  
              />
            </div>
            {/* 第三張圖(第一地點)*/}
            <div className="col-4 mt-5">
              <ComparisonChartDisplay
                title="(Real) Comparison: 台北"
                data={rdata.filter(d => d.location === "台北")}
                predictedData={futurerData.filter(d => d.location === "台北")}
                backPast={30}  //真實資料往前顯示30筆
                fwdPred={10}   //預測資料往後10筆
              />
            </div>
            <div className="col-4 mt-5">
              <ComparisonChartDisplay
                title="(Real) Comparison: 高雄"
                data={rdata.filter(d => d.location === "高雄")}
                predictedData={futurerData.filter(d => d.location === "高雄")}
                backPast={30}  //真實資料往前顯示30筆
                fwdPred={10}   //預測資料往後10筆
              />
            </div>
            <div className="col-4 mt-5">
              <ComparisonChartDisplay
                title="(Real) Comparison: 玉山"
                data={rdata.filter(d => d.location === "玉山")}
                predictedData={futurerData.filter(d => d.location === "玉山")}
                backPast={30}  //真實資料往前顯示30筆
                fwdPred={10}   //預測資料往後10筆
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;