// middleware/auth.js
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// function authenticateToken(req, res, next) {
//   const auth = req.headers['authorization'];
//   // NEW: Check cookies first, fallback to Authorization header
//   const token =
//     (req.cookies && req.cookies.accessToken) || (auth && auth.split(' ')[1]);

//   if (!token) return res.status(401).json({ message: 'No token' });

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
//     if (err) return res.status(403).json({ message: 'Token invalid' });

//     req.user = {
//       id: payload.id,
//       email: payload.email,
//       role: payload.role,
//       company_id: payload.company_id // Make sure this is included in your JWT
//     };
//     next();
//   });
// }

// module.exports = { authenticateToken };

const jwt = require('jsonwebtoken');
require('dotenv').config();

async function authenticateToken(req, res, next) {
  const auth = req.headers['authorization'];
  const token =
    (req.cookies && req.cookies.accessToken) || (auth && auth.split(' ')[1]);

  if (!token) return res.status(401).json({ message: 'No token' });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
    if (err) return res.status(403).json({ message: 'Token invalid' });

    try {
      // Get user with role details
      const pool = require('../db');
      const [users] = await pool.execute(
        `SELECT u.id, u.email, u.company_id, r.role_name as role, u.role_id
         FROM users u 
         LEFT JOIN roles r ON u.role_id = r.id 
         WHERE u.id = ?`,
        [payload.id]
      );

      if (!users.length) {
        return res.status(403).json({ message: 'User not found' });
      }

      const user = users[0];
      
      req.user = {
        id: user.id,
        firstname:user.firstname,
        email: user.email,
        role: user.role,
        role_id: user.role_id,
        company_id: user.company_id
      };
      next();
    } catch (dbErr) {
      console.error('Database error in auth middleware:', dbErr);
      return res.status(500).json({ message: 'Server error' });
    }
  });
}

module.exports = { authenticateToken };
