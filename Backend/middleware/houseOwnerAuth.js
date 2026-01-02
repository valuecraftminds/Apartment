// middleware/houseOwnerAuth.js
const jwt = require('jsonwebtoken');

const authenticateHouseOwner = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    
    // Check if user is a house owner
    if (user.role !== 'houseowner') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. House owners only.' 
      });
    }
    
    req.houseowner = user;
    next();
  });
};

module.exports = { authenticateHouseOwner };