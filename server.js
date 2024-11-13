const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://98.84.242.113:3001'
}));

let db;

console.log("Attempting to connect to MongoDB...");

MongoClient.connect(process.env.MONGODB_URI)
  .then(client => {
    console.log('Connected to Database');
    db = client.db('testdb');

    // 嘗試直接插入測試數據，並捕獲任何錯誤
    console.log("Inserting test data...");
    db.collection('data').insertMany([
      { name: "Sample Item 1", value: 123 },
      { name: "Sample Item 2", value: 456 }
    ])
    .then(() => console.log("Inserted initial test data"))
    .catch(error => {
      if (error.code === 11000) {
        console.log("Test data already exists, skipping insertion.");
      } else {
        console.error("Error inserting test data:", error);
      }
    });
  })
  .catch(error => {
    console.error("Error connecting to MongoDB:", error);
  });

app.use(express.json());

app.get('/api/data', async (req, res) => {
  console.log("Received request for /api/data");

  try {
    const data = await db.collection('data').find({}).toArray();
    console.log("Data fetched from MongoDB:", data);
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

