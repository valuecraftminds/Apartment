// index.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const { verifyTransport } = require('./helpers/email');
const path = require('path');
// optional protected example route
const { authenticateToken } = require('./middleware/auth');

const app = express();
// Add this before your routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors
  ({ origin: process.env.FRONTEND_URL || '*', credentials: true }));

 

const limiter = rateLimit({ windowMs: 60_000, max: 100 });
app.use(limiter);

app.use('/api/auth', authRoutes);



app.get('/api/me', authenticateToken, async (req, res) => {
  // return user info example
  const pool = require('./db');
  const [rows] = await pool.execute('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);
  res.json(rows[0]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await verifyTransport(); // test SMTP
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const tenantRoutes = require('./routes/tenants');
app.use('/api/tenants', tenantRoutes);

//Route usage of Apartments
const apartmentRoutes = require('./routes/apartments');
app.use('/api/apartments', authenticateToken, apartmentRoutes);

//Routes the countries
const countryRoutes = require('./routes/countries');
app.use('/api/countries', countryRoutes);

//Routes the floor
const floorRoutes = require('./routes/floors');
app.use('/api/floors', authenticateToken, floorRoutes);

//Routes the houses
const houseRoutes = require('./routes/houses');
app.use('/api/houses',authenticateToken,houseRoutes);

