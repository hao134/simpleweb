import { useEffect, useState } from "react";
import FilterControls from "./components/FilterControls";
import ChartDisplay from "./components/ChartDisplay";
import { fetchTemperatureData, fetchFuturePredictions } from "./services/api";


const App = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [futureData, setFutureData] = useState([]); //預測數據
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedWarehouse, setSelectedWarehouse] = useState(["All"]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("faked")

  // Tab 切換 handle
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };
  
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

  
  if (error) {
    return <p style={{ color: "red" }}>Error: {error}</p>;
  }
  
  return (
    <div className="container-fluid p-0">
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
          <div className="row g-0">
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
            <div className="col-12">
              <ChartDisplay 
                data={data} 
                futureData={futureData} 
                title="Historical + Predictions (All Warehouses)"
                historyLimit={36}  
              />
            </div>
          </div>
          
        </div>
      )}

      {activeTab === "real" && (

        <div className="mt-3">
          <div className="row">
            <div className="col-6">
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
            <div className="col-6">
              <ChartDisplay 
                data={data} 
                futureData={futureData} 
                title="Historical + Predictions (All Warehouses)"
                historyLimit={36}  
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;