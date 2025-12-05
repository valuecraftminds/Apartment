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
// app.use(cors
//   ({ origin: process.env.FRONTEND_URL || '*', credentials: true }));

app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      // `http://192.168.8.101:3000`,  // Your computer IP with frontend port
      // `http://192.168.8.101:5173`   // Your computer IP with Vite port
    ].filter(Boolean);

    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

 

const limiter = rateLimit({ windowMs: 60_000, max: 100 });
app.use(limiter);

app.use('/api/auth', authRoutes);



app.get('/api/me', authenticateToken, async (req, res) => {
  // return user info example
  const pool = require('./db');
  const [rows] = await pool.execute('SELECT id, firstname,lastname,country,mobile, email, role FROM users WHERE id = ?', [req.user.id]);
  res.json(rows[0]);
});

const PORT = process.env.PORT || '*';
app.listen(PORT,'0.0.0.0',async () => {
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

//Routes the house types
const houseTypeRoutes = require ('./routes/houseType');
app.use('/api/housetype',authenticateToken,houseTypeRoutes);

//Routes the house owner
const houseOwnerRoutes = require('./routes/houseOwner');
app.use('/api/houseowner',authenticateToken,houseOwnerRoutes);

//Routes the bills
const billRoutes = require('./routes/bills');
app.use('/api/bills',authenticateToken,billRoutes);

//Routes of bill range
const billRangeRoutes = require('./routes/billRanges');
app.use('/api/billranges', authenticateToken,billRangeRoutes);

//Routes of bill price
const billPriceRoutes = require('./routes/billPrice');
app.use('/api/billprice', authenticateToken, billPriceRoutes)

//Routes for bill assignments
const billAssignmentsRoutes = require('./routes/billAssignments');
app.use('/api/bill-assignments', billAssignmentsRoutes);

//Routes for bulk imports
const bulkImportRoutes = require('./routes/bulkImports');
app.use('/api/bulk-import', bulkImportRoutes);

//Routes for role
const roleRoutes = require('./routes/roles')
app.use('/api/roles',roleRoutes);

//Routes for role components
const roleComponentRoutes = require('./routes/roleComponent');
app.use('/api/role-components', roleComponentRoutes);

//Routes for apartment documents
const apartmentDocumentRoutes = require('./routes/apartmentDocuments');
app.use('/api/apartment-documents',apartmentDocumentRoutes)

// Routes for floor documents
const floorDocumentRoutes = require('./routes/floorDocuments');
app.use('/api/floor-documents', floorDocumentRoutes);

//Routes for house documents
const houseDocumentRoutes = require('./routes/houseDocuments');
app.use('/api/house-documents',houseDocumentRoutes);

//Routes for assign apartments for users
const userApartmentRoutes = require('./routes/userApartments');
app.use('/api/user-apartments',userApartmentRoutes);

//Routes for shared value price 
const sharedValuePriceRoutes = require('./routes/sharedValuePrices');
app.use('/api/shared-value-prices',sharedValuePriceRoutes);

//Routes for generate bills
const generateBillRoutes = require('./routes/generateBills');
app.use('/api/generate-bills',generateBillRoutes);

//Routes for bill Payments
const billPaymentRoutes = require('./routes/billPayments');
app.use('/api/bill-payments',billPaymentRoutes);

//Routes for generate measurable bills
const generateMeasurableBillsRoutes = require('./routes/generateMeasurableBills');
app.use('/api/generate-measurable-bills', generateMeasurableBillsRoutes);