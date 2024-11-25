import { useEffect, useState } from "react";
import FilterControls from "./components/FilterControls";
import ChartDisplay from "./components/ChartDisplay";
import { fetchTemperatureData } from "./services/api";


const App = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  //fix the problem n.map is not a function 2
  const [selectedWarehouse, setSelectedWarehouse] = useState(["All"]);
  const [error, setError] = useState(null);
  
  // 當初次進入時獲取資料
  useEffect(() => {
    fetchTemperatureData()
      .then((fetchedData) => setData(fetchedData))
      .catch((error) => {setError(error.message);});
  }, []);

  // 根據user選擇來過濾資料
  useEffect(() => {
    const filtered= data.filter((item) => {
      const date = new Date(item.timestamp);
      const inDateRange =
        (!dateRange.start || date >= new Date(dateRange.start)) &&
        (!dateRange.end || date <= new Date(dateRange.end));
      // //fix the problem n.map is not a function 1
      // const matchesWarehouse = 
      //   selectedWarehouse.includes("All") ||
      //   selectedWarehouse.some((warehouse) => warehouse === item.location)
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
    <div>
      <h1>Temperature Data Visualization</h1>

      {/* 篩選條件 */}
      <FilterControls
        data={data}
        dateRange={dateRange}
        selectedWarehouses={selectedWarehouse}
        setDateRange={setDateRange}
        setSelectedWarehouses={setSelectedWarehouse}
      />

      <ChartDisplay data={filteredData} />
      {/* 上方圖表
      <ChartDisplay title="All Warehouses" chartData={allChartData} /> */}

      {/* 下方圖表
      <ChartDisplay 
          title={
            selectedWarehouse === "All"
              ? "Filtered Data for All Warehouses"
              : `Filtered Data for ${selectedWarehouse}`
          }
          chartData={singleChartData}
      /> */}
    </div>
  );
}

export default App;
