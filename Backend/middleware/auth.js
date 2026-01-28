// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function authenticateToken(req, res, next) {
  // Allow public access to tenant registration endpoint even if middleware is attached
  if (req.path && req.path.startsWith('/api/tenants')) {
    return next();
  }
  const auth = req.headers['authorization'];
  const token =
    (req.cookies && req.cookies.accessToken) || (auth && auth.split(' ')[1]);

  if (!token) return res.status(401).json({ message: 'No token' });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
    if (err) return res.status(403).json({ message: 'Token invalid' });

    try {
      const userType = payload.user_type;
      const pool = require('../db');
      
      if (userType === 'user') {
        // Regular user (admin/employee)
        const [users] = await pool.execute(
          `SELECT u.id, u.email, u.firstname, u.company_id, r.role_name as role, u.role_id
           FROM users u 
           LEFT JOIN roles r ON u.role_id = r.id 
           WHERE u.id = ? AND u.is_active = 1`,
          [payload.id]
        );

        if (!users.length) {
          return res.status(403).json({ message: 'User not found or inactive' });
        }

        const user = users[0];
        
        req.user = {
          id: user.id,
          firstname: user.firstname,
          email: user.email,
          role: user.role,
          role_id: user.role_id,
          company_id: user.company_id,
          user_type: 'user'
        };
        
      } else if (userType === 'houseowner') {
        // House owner
        const [houseOwners] = await pool.execute(
          `SELECT id, name, email, mobile, apartment_id, is_active, company_id
           FROM houseowner 
           WHERE id = ? AND is_active = 1`,
          [payload.id || payload.houseowner_id]
        );
        
        if (!houseOwners.length) {
          return res.status(403).json({ message: 'House owner not found or inactive' });
        }

        const houseOwner = houseOwners[0];
        
        req.user = {
          id: houseOwner.id,
          name: houseOwner.name,
          email: houseOwner.email,
          mobile: houseOwner.mobile,
          apartment_id: houseOwner.apartment_id,
          company_id: houseOwner.company_id,
          role: 'houseowner',
          user_type: 'houseowner'
        };
      } else {
        return res.status(403).json({ message: 'Invalid user type' });
      }
      
      next();
    } catch (dbErr) {
      console.error('Database error in auth middleware:', dbErr);
      return res.status(500).json({ message: 'Server error' });
    }
  });
}

module.exports = { authenticateToken };