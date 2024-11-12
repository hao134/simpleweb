const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

let db;

// 設定 MongoDB 連接
MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database');
    db = client.db('testdb');
  })
  .catch(error => console.error(error));

app.use(express.json());

// 建立簡單 API
app.get('/api/data', async (req, res) => {
  const data = await db.collection('data').find().toArray();
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

