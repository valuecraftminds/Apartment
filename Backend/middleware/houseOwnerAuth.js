// // // middleware/houseOwnerAuth.js
// // const jwt = require('jsonwebtoken');

// // const authenticateHouseOwner = (req, res, next) => {
// //   const authHeader = req.headers['authorization'];
// //   const token = authHeader && authHeader.split(' ')[1];
  
// //   if (!token) {
// //     return res.status(401).json({ 
// //       success: false, 
// //       message: 'Access token required' 
// //     });
// //   }

// //   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
// //     if (err) {
// //       return res.status(403).json({ 
// //         success: false, 
// //         message: 'Invalid token' 
// //       });
// //     }
    
// //     // Check if user is a house owner
// //     if (user.role !== 'houseowner') {
// //       return res.status(403).json({ 
// //         success: false, 
// //         message: 'Access denied. House owners only.' 
// //       });
// //     }
    
// //     req.houseowner = user;
// //     next();
// //   });
// // };

// // module.exports = { authenticateHouseOwner };

// // middleware/houseOwnerAuth.js
// const jwt = require('jsonwebtoken');

// const authenticateHouseOwner = async (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
  
//   if (!token) {
//     return res.status(401).json({ 
//       success: false, 
//       message: 'Access token required' 
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
//     // Check database to ensure house owner exists
//     const pool = require('../db');
//     const [houseOwners] = await pool.execute(
//       `SELECT id, name, email, mobile, apartment_id, is_active
//        FROM houseowner 
//        WHERE id = ?`,
//       [decoded.houseowner_id || decoded.id]
//     );

//     if (!houseOwners.length) {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'House owner not found' 
//       });
//     }

//     if (houseOwners[0].is_active !== 1) {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'House owner account is inactive' 
//       });
//     }

//     const houseOwner = houseOwners[0];
    
//     req.houseowner = {
//       id: houseOwner.id,
//       houseowner_id: houseOwner.id,
//       email: houseOwner.email,
//       name: houseOwner.name,
//       mobile: houseOwner.mobile,
//       apartment_id: houseOwner.apartment_id,
//       is_active: houseOwner.is_active,
//       role: 'houseowner'
//     };
    
//     next();
//   } catch (err) {
//     console.error('House owner auth error:', err);
//     return res.status(403).json({ 
//       success: false, 
//       message: 'Invalid token' 
//     });
//   }
// };

// module.exports = { authenticateHouseOwner };


// middleware/houseOwnerAuth.js
// const jwt = require('jsonwebtoken');

// // middleware/houseOwnerAuth.js - Update with better debugging
// const authenticateHouseOwner = async (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
  
//   if (!token) {
//     return res.status(401).json({ 
//       success: false, 
//       message: 'Access token required' 
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
//     console.log('🔍 JWT Decoded:', {
//       id: decoded.id,
//       houseowner_id: decoded.houseowner_id,
//       email: decoded.email,
//       name: decoded.name
//     });
    
//     // Use the ID from the JWT
//     const houseOwnerId = decoded.houseowner_id || decoded.id;
    
//     if (!houseOwnerId) {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'Invalid token: No house owner ID found' 
//       });
//     }

//     // Check database
//     const pool = require('../db');
    
//     console.log('🔍 Querying database for houseowner ID:', houseOwnerId);
    
//     const [houseOwners] = await pool.execute(
//       `SELECT id, name, email, mobile, apartment_id, is_active, company_id
//        FROM houseowner 
//        WHERE id = ?`,
//       [houseOwnerId]
//     );

//     console.log('🔍 Database query result:', {
//       found: houseOwners.length > 0,
//       houseowner: houseOwners[0] || 'Not found',
//       is_active: houseOwners[0]?.is_active
//     });

//     if (!houseOwners.length) {
//       // Let's check what's actually in the database
//       const [allHouseOwners] = await pool.execute('SELECT id, email FROM houseowner LIMIT 5');
//       console.log('🔍 First 5 houseowners in DB:', allHouseOwners);
      
//       return res.status(403).json({ 
//         success: false, 
//         message: 'House owner not found in database' 
//       });
//     }

//     if (houseOwners[0].is_active !== 1) {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'House owner account is inactive' 
//       });
//     }

//     const houseOwner = houseOwners[0];
    
//     req.houseowner = {
//       id: houseOwner.id,
//       houseowner_id: houseOwner.id,
//       email: houseOwner.email,
//       name: houseOwner.name,
//       mobile: houseOwner.mobile,
//       apartment_id: houseOwner.apartment_id,
//       company_id: houseOwner.company_id,
//       is_active: houseOwner.is_active,
//       role: 'houseowner'
//     };
    
//     console.log('✅ Authenticated house owner:', req.houseowner);
//     next();
//   } catch (err) {
//     console.error('❌ House owner auth error:', err);
//     return res.status(403).json({ 
//       success: false, 
//       message: 'Invalid token' 
//     });
//   }
// };

// module.exports = { authenticateHouseOwner };

// middleware/houseOwnerAuth.js - UPDATED VERSION
const jwt = require('jsonwebtoken');
const pool = require('../db'); // Import at the top

const authenticateHouseOwner = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    console.log('🔍 JWT Decoded:', {
      id: decoded.id,
      houseowner_id: decoded.houseowner_id,
      email: decoded.email,
      name: decoded.name,
      iat: decoded.iat,
      exp: decoded.exp
    });
    
    // Check if token is expired
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    // Get houseowner ID
    const houseOwnerId = decoded.houseowner_id || decoded.id;
    
    if (!houseOwnerId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid token: No house owner ID found' 
      });
    }

    console.log('🔍 Looking for houseowner ID:', houseOwnerId);
    
    try {
      // Execute query with error handling
      const [houseOwners] = await pool.execute(
        `SELECT id, name, email, mobile, apartment_id, is_active, company_id
         FROM houseowner 
         WHERE id = ?`,
        [houseOwnerId]
      );
      
      console.log('🔍 Query executed. Results found:', houseOwners.length);
      
      if (!houseOwners.length) {
        // Additional check - try with different case or trimming
        console.log('⚠️ Houseowner not found. Checking for case/space issues...');
        
        // Try alternative query to see what's in the table
        const [allOwners] = await pool.execute(
          'SELECT id, email, name FROM houseowner WHERE id LIKE ?',
          [`%${houseOwnerId}%`]
        );
        
        console.log('Similar IDs found:', allOwners);
        
        return res.status(403).json({ 
          success: false, 
          message: `House owner not found. ID: ${houseOwnerId}` 
        });
      }

      const houseOwner = houseOwners[0];
      
      console.log('🔍 Found houseowner:', {
        id: houseOwner.id,
        email: houseOwner.email,
        name: houseOwner.name,
        is_active: houseOwner.is_active
      });
      
      if (houseOwner.is_active !== 1) {
        return res.status(403).json({ 
          success: false, 
          message: 'House owner account is inactive' 
        });
      }

      // Set request data
      req.houseowner = {
        id: houseOwner.id,
        houseowner_id: houseOwner.id,
        email: houseOwner.email,
        name: houseOwner.name,
        mobile: houseOwner.mobile,
        apartment_id: houseOwner.apartment_id,
        company_id: houseOwner.company_id,
        is_active: houseOwner.is_active,
        role: 'houseowner'
      };
      
      console.log('✅ Successfully authenticated house owner:', req.houseowner.id);
      next();
      
    } catch (dbError) {
      console.error('❌ Database query error:', dbError);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error during authentication' 
      });
    }
    
  } catch (jwtError) {
    console.error('❌ JWT verification error:', jwtError);
    
    if (jwtError.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    if (jwtError.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    
    return res.status(403).json({ 
      success: false, 
      message: 'Token verification failed' 
    });
  }
};

module.exports = { authenticateHouseOwner };