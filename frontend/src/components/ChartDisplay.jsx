const ChartDisplay = ({ title, chartData }) => {
    return (
      <div>
        <h2>{title}</h2>
        {chartData ? (
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
        ) : (
          <p>Loading...</p>
        )}
      </div>
    );
  };
  
  export default ChartDisplay;
  