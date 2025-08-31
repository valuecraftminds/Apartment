// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
  const auth = req.headers['authorization'];
  // NEW: Check cookies first, fallback to Authorization header
  const token =
    (req.cookies && req.cookies.accessToken) || (auth && auth.split(' ')[1]);

  if (!token) return res.status(401).json({ message: 'No token' });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ message: 'Token invalid' });

    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      company_id: payload.company_id // Make sure this is included in your JWT
    };
    next();
  });
}

module.exports = { authenticateToken };
