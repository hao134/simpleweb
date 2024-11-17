import React, { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  // 從環境變量中讀取 API基礎 URL
  //const API_BASE_URL = `http://${process.env.REACT_APP_PUBLIC_IP}:3000/api/temperature_data`;
  const API_BASE_URL = "https://98.84.242.113/api/temperature_data";
  // test
  //console.log("Environment Variable:", process.env.REACT_APP_PUBLIC_IP);

  useEffect(() => {
    fetch(API_BASE_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setData(data))
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(error.message);
      });
  }, [API_BASE_URL]);

  return (
    <div>
      <h1>Temperature Data</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {data.length > 0 ? (
        <>
          <h2>Total Records: {data.length}</h2>
          <ul>
            {data.map((item, index) => (
              <li key={index}>
                <strong>Timestamp:</strong> {item.timestamp} |
                <strong>Location:</strong> {item.location} |
                <strong>Temperature:</strong> {item.temperature}°C
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Loading data or no records found...</p>
      )}
    </div>
  );
}

export default App;