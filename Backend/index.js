// index.js
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const { verifyTransport } = require('./helpers/email');
const { authenticateToken } = require('./middleware/auth');

const app = express();

/* =====================================================
   PROXY (IMPORTANT for Hostinger / Nginx / Cloudflare)
===================================================== */
app.set('trust proxy', 1);

/* =====================================================
   RATE LIMITERS
===================================================== */
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: true,
    xForwardedForHeader: true
  },
  message: {
    status: 429,
    error: 'Too many requests, please try again later.'
  }
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: 429,
      error: 'Too many auth requests. Please try again later.'
    });
  }
});

/* =====================================================
   CORS (NO WILDCARDS ❌)
===================================================== */
const allowedOrigins = [
  'http://localhost:5173',
  // 'https://apartment.valuecraftminds.com',
  // 'https://apmt.apivcm.shop',
   'http://localhost:2500',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    cb(new Error('CORS not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Retry-After', 'Set-Cookie'],
  optionsSuccessStatus: 200
}));

// ✅ FIXED OPTIONS HANDLER (Node 20 safe)
app.options(/.*/, cors());

/* =====================================================
   SECURITY & BODY PARSERS
===================================================== */
// app.use(helmet());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =====================================================
   STATIC FILES
===================================================== */
// Add this before your routes
// Ensure static file responses include CORS headers so browsers can load images/docs
app.use('/uploads', (req, res, next) => {
  const origin = req.headers.origin;
  // allowedOrigins defined earlier in this file
  if (origin && allowedOrigins && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  } else if (!origin) {
    // non-CORS (same-origin) requests - allow broadly
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  next();
}, express.static(path.join(__dirname, 'uploads')));

app.use('/evidance', (req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  next();
}, express.static(path.join(__dirname, 'evidance')));

/* =====================================================
   RATE LIMIT APPLY (SKIP OPTIONS)
===================================================== */
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next();

  if (req.path.startsWith('/api/auth')) {
    return authLimiter(req, res, next);
  }
  return globalLimiter(req, res, next);
});

/* =====================================================
   SAFE ROUTE LOADER
===================================================== */
function safeRequireRoute(modulePath) {
  try {
    return require(modulePath);
  } catch (err) {
    console.error(`❌ Failed to load route ${modulePath}`, err);
    const router = express.Router();
    router.use((req, res) => {
      res.status(500).json({
        error: 'Route failed to load',
        route: modulePath
      });
    });
    return router;
  }
}

function mountRoute(urlPath, modulePath, middlewares = []) {
  const router = safeRequireRoute(modulePath);
  if (middlewares.length) {
    app.use(urlPath, ...middlewares, router);
  } else {
    app.use(urlPath, router);
  }
}

/* =====================================================
   ROUTES (ONLY RELATIVE PATHS ✅)
===================================================== */
mountRoute('/api/auth', './routes/auth');

app.get('/api/me', authenticateToken, async (req, res) => {
  const pool = require('./db');
  const [rows] = await pool.execute(
    'SELECT id, firstname, lastname, country, mobile, email, role FROM users WHERE id = ?',
    [req.user.id]
  );
  res.json(rows[0]);
});

mountRoute('/api/tenants', './routes/tenants', [authenticateToken]);
mountRoute('/api/apartments', './routes/apartments', [authenticateToken]);
mountRoute('/api/countries', './routes/countries');
mountRoute('/api/floors', './routes/floors', [authenticateToken]);
mountRoute('/api/houses', './routes/houses');
mountRoute('/api/housetype', './routes/houseType', [authenticateToken]);
mountRoute('/api/houseowner', './routes/houseOwner', [authenticateToken]);
mountRoute('/api/bills', './routes/bills', [authenticateToken]);
mountRoute('/api/billranges', './routes/billRanges', [authenticateToken]);
mountRoute('/api/billprice', './routes/billPrice', [authenticateToken]);
mountRoute('/api/bill-assignments', './routes/billAssignments', [authenticateToken]);
mountRoute('/api/bulk-import', './routes/bulkImports', [authenticateToken]);
mountRoute('/api/roles', './routes/roles', [authenticateToken]);
mountRoute('/api/role-components', './routes/roleComponent', [authenticateToken]);
mountRoute('/api/apartment-documents', './routes/apartmentDocuments', [authenticateToken]);
mountRoute('/api/floor-documents', './routes/floorDocuments', [authenticateToken]);
mountRoute('/api/house-documents', './routes/houseDocuments', [authenticateToken]);
mountRoute('/api/user-apartments', './routes/userApartments', [authenticateToken]);
mountRoute('/api/shared-value-prices', './routes/sharedValuePrices', [authenticateToken]);
mountRoute('/api/generate-bills', './routes/generateBills', [authenticateToken]);
mountRoute('/api/bill-payments', './routes/billPayments');
mountRoute('/api/generate-measurable-bills', './routes/generateMeasurableBills', [authenticateToken]);
mountRoute('/api/user-bills', './routes/userBills', [authenticateToken]);
mountRoute('/api/family', './routes/family', [authenticateToken]);
mountRoute('/api/houseowner-auth', './routes/houseOwnerAuth' );
mountRoute('/api/complaints', './routes/complaints');
mountRoute('/api/categories', './routes/categories');
mountRoute('/api/technician-categories', './routes/technicianCategories');

/* =====================================================
   HEALTH CHECK
===================================================== */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString() });
});

/* =====================================================
   404 (REGEX – NO "*")
===================================================== */
app.use(/.*/, (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/* =====================================================
   ERROR SAFETY
===================================================== */
process.on('uncaughtException', err => {
  console.error('🔥 Uncaught Exception:', err);
});

process.on('unhandledRejection', err => {
  console.error('🔥 Unhandled Rejection:', err);
});

/* =====================================================
   START SERVER
===================================================== */
const PORT = process.env.PORT || 2500;

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server running on port ${PORT}`);
 
  await verifyTransport();
});
