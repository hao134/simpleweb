const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;


// set cors
app.use(cors({
  origin: 'http://34.205.141.156:3001'
}));

let db;

// 設定 MongoDB 連接
MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database');
    db = client.db('testdb');
    
    // 檢查集合是否為空並插入測試數據
    db.co('data').countDocuments((err, count) => {
      if (err) {
        console.error("Error counting documents:", err);
	db.collection('data').insertMany([ 
	  
	])
      }
    }
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

