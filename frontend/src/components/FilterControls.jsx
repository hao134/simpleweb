const FilterControls = ({
  dateRange,
  handleDateChange,
  selectedWarehouse,
  handleWarehouseChange,
  warehouses,
}) => {
  return (
    <div>
      <label>
        Start Date:
        <input
          type="date"
          name="start"
          value={dateRange.start}
          onChange={handleDateChange}
        />
      </label>
      <label>
        End Date:
        <input
          type="date"
          name="end"
          value={dateRange.end}
          onChange={handleDateChange}
        />
      </label>
      <label>
        Warehouse:
        <select value={selectedWarehouse} onChange={handleWarehouseChange}>
          <option value="All">All</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse} value={warehouse}>
              {warehouse}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default FilterControls