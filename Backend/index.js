require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

// Test the connection when server starts
pool.getConnection((err, connection) => {
  if (err) {
    console.error('DB connection failed:', err);
  } else {
    console.log('Database connected successfully!');
    connection.release(); // release back to pool
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'Backend is alive!' });
});


const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
