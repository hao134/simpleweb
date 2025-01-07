const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 設置 CORS，允許從前端訪問
app.use(cors({
  origin: `https://${process.env.PUBLICIP}` // 替換為你的前端 IP
}));

let db;

console.log("Attempting to connect to MongoDB...");

MongoClient.connect(process.env.MONGODB_URI)
  .then(client => {
    console.log('Connected to Database');
    db = client.db('sensor_data_db'); 
  })
  .catch(error => {
    console.error("Error connecting to MongoDB:", error);
  });

app.use(express.json());

// 新增的 /api/temperature_data 路由
app.get('/api/temperature_data', async (req, res) => {
  console.log("Received request for /api/temperature_data");

  try {
    const temperatureData = await db.collection('temperature_data').find({}).toArray();
    console.log("Data fetched from 'temperature_data':", temperatureData);
    res.json(temperatureData);
  } catch (error) {
    console.error("Error fetching data from 'temperature_data':", error);
    res.status(500).json({ error: "Failed to fetch data from 'temperature_data'" });
  }
});

// 新增的 /api/future_temperature_data 路由
app.get('/api/future_temperature_data', async (req, res) => {
  console.log("Received request for /api/future_temperature_data");

  try {
    const futuretemperatureData = await db.collection('future_temperature_data').find({}).toArray();
    console.log("Data fetched from 'future_temperature_data':", futuretemperatureData);
    res.json(futuretemperatureData);
  } catch (error) {
    console.error("Error fetching data from 'temperature_data':", error);
    res.status(500).json({ error: "Failed to fetch data from 'temperature_data'" });
  }
});

// 新增的 /api/temperature_realdata 路由
app.get('/api/temperature_realdata', async (req, res) => {
  console.log("Received request for /api/temperature_realdata");

  try {
    const temperatureRData = await db.collection('temperature_realdata').find({}).toArray();
    console.log("Data fetched from 'temperature_realdata':", temperatureRData);
    res.json(temperatureRData);
  } catch (error) {
    console.error("Error fetching data from 'temperature_realdata':", error);
    res.status(500).json({ error: "Failed to fetch data from 'temperature_realdata'" });
  }
});

// 新增的 /api/future_realtemperature_data 路由
app.get('/api/future_realtemperature_data', async (req, res) => {
  console.log("Received request for /api/future_realtemperature_data");

  try {
    const futuretemperatureRData = await db.collection('future_temperature_realdata').find({}).toArray();
    console.log("Data fetched from 'future_temperature_realdata':", futuretemperatureRData);
    res.json(futuretemperatureRData);
  } catch (error) {
    console.error("Error fetching data from 'future_temperature_realdata':", error);
    res.status(500).json({ error: "Failed to fetch data from 'future_temperature_realdata'" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
