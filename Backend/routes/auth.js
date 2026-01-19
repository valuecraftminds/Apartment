// routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {authenticateToken} = require('../middleware/auth')
const { sendVerificationEmail, sendPasswordResetEmail, sendInvitationEmail } = require('../helpers/email');
require('dotenv').config();

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;
const isProd = process.env.NODE_ENV === 'production';

function makeCookieOptions(maxAge, sameSite = isProd ? 'none' : 'lax', secure = isProd) {
  const opts = {
    httpOnly: true,
    secure,
    sameSite,
    maxAge
  };
  if (COOKIE_DOMAIN) opts.domain = COOKIE_DOMAIN;
  return opts;
}

function signAccessToken(user) {
  return jwt.sign({ 
    id: user.id, 
    firstname:user.firstname,
    email: user.email, 
    role: user.role_name || user.role, // Support both structures
    role_id: user.role_id,
    company_id: user.company_id
  }, process.env.ACCESS_TOKEN_SECRET, { 
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
  });
}

function signRefreshToken(user) {
  return jwt.sign({ 
    id: user.id
  }, 
  process.env.REFRESH_TOKEN_SECRET, { 
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN 
  });
}

/* Register: create user, store hashed verification token, send email */
router.post('/register', async (req, res) => {
  try {
    const { firstname, lastname, country, mobile, email, password, company_id } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const [exists] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length) return res.status(409).json({ message: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 12);
    
    // FIXED: Handle company_id properly - convert undefined to null
    const [ins] = await pool.execute(
      'INSERT INTO users (firstname, lastname, country, mobile, email, password_hash, is_verified, is_active, company_id) VALUES (?, ?, ?, ?, ?, ?, 0, 1, ?)',
      [
        firstname || null, 
        lastname || null, 
        country || null, 
        mobile || null, 
        email, 
        password_hash,
        company_id || null // Convert undefined to null
      ]
    );
    
    const userId = ins.insertId;

    // NEW: Create default Admin role if this is the first user for the company
    let roleId = null;
    if (company_id) {
      // Check if this is the first user for this company
      const [companyUsers] = await pool.execute(
        'SELECT COUNT(*) as userCount FROM users WHERE company_id = ?',
        [company_id]
      );
      
      // If this is the first user for the company, create default Admin role
      if (companyUsers[0].userCount === 1) {
        const { v4: uuidv4 } = require('uuid');
        roleId = uuidv4().replace(/-/g, '').substring(0, 10);
        
        // Create default Admin role
        await pool.execute(
          'INSERT INTO roles (id, company_id, role_name, is_active) VALUES (?, ?, "Admin", 1)',
          [roleId, company_id]
        );
        
        console.log(`Default Admin role created for company ${company_id}`);
        
        // Also create some other default roles
        const defaultRoles = [
          { id: uuidv4().replace(/-/g, '').substring(0, 10), name: 'Apartment_manager' },
          { id: uuidv4().replace(/-/g, '').substring(0, 10), name: 'Apartment_technician' },
        ];
        
        for (const role of defaultRoles) {
          await pool.execute(
            'INSERT INTO roles (id, company_id, role_name, is_active) VALUES (?, ?, ?, 1)',
            [role.id, company_id, role.name]
          );
        }
        
        console.log(`Default roles created for company ${company_id}`);
      } else {
        // If not the first user, find the existing Admin role
        const [adminRole] = await pool.execute(
          'SELECT id FROM roles WHERE company_id = ? AND role_name = "Admin" AND is_active = 1 LIMIT 1',
          [company_id]
        );
        
        if (adminRole.length > 0) {
          roleId = adminRole[0].id;
        }
      }
      
      // Assign the role to the user
      if (roleId) {
        await pool.execute(
          'UPDATE users SET role_id = ? WHERE id = ?',
          [roleId, userId]
        );
        console.log(`Assigned role ${roleId} to user ${userId}`);
      }
    }

    // create verification token (plain->email, hash->DB)
    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
    const expiresAt = new Date(Date.now() + (Number(process.env.VERIFICATION_TOKEN_EXPIRES_HOURS || 24) * 3600 * 1000));

    await pool.execute('UPDATE users SET verification_token_hash = ?, verification_token_expires = ? WHERE id = ?', [tokenHash, expiresAt, userId]);

    // send verification email
    await sendVerificationEmail(email, plainToken, userId);

    res.status(201).json({ 
      message: 'User registered, check email to verify',
      user_id: userId,
      role_assigned: !!roleId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* Verify: frontend reads token&id from query and POSTs to /verify */
router.post('/verify', async (req, res) => {
  try {
    const { token, id } = req.body;
    console.log('Verification request:', { token: token ? 'present' : 'missing', id: id ? 'present' : 'missing' });
    
    if (!token || !id) {
      console.log('Missing token or id');
      return res.status(400).json({ message: 'Token and ID are required' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    console.log('Looking for user with id:', id);
    
    const [rows] = await pool.execute(
      'SELECT verification_token_hash, verification_token_expires, is_verified FROM users WHERE id = ?', 
      [id]
    );
    
    if (!rows.length) {
      console.log('No user found with id:', id);
      return res.status(400).json({ message: 'Invalid verification link' });
    }

    const user = rows[0];
    console.log('User found:', { 
      hasToken: !!user.verification_token_hash,
      isVerified: user.is_verified,
      expires: user.verification_token_expires 
    });

    if (user.is_verified) {
      return res.status(200).json({ message: 'Already verified' });
    }

    if (!user.verification_token_hash) {
      console.log('No verification token hash in database');
      return res.status(400).json({ message: 'Invalid token' });
    }

    if (user.verification_token_hash !== tokenHash) {
      console.log('Token mismatch:', {
        expected: user.verification_token_hash,
        received: tokenHash
      });
      return res.status(400).json({ message: 'Invalid token' });
    }

    if (new Date(user.verification_token_expires) < new Date()) {
      console.log('Token expired');
      return res.status(400).json({ message: 'Token expired' });
    }

    await pool.execute(
      'UPDATE users SET is_verified = 1, verification_token_hash = NULL, verification_token_expires = NULL WHERE id = ?', 
      [id]
    );
    
    console.log('User verified successfully:', id);
    return res.json({ message: 'Email verified successfully' });
    
  } catch (err) {
    console.error('Verification error:', err);
    return res.status(500).json({ message: 'Server error during verification' });
  }
});


/* Resend verification */
router.post('/resend', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Resend verification request for:', email);
    
    if (!email) return res.status(400).json({ message: 'Email required' });

    const [rows] = await pool.execute('SELECT id, is_verified, email FROM users WHERE email = ?', [email]);
    if (!rows.length) {
      console.log('User not found for email:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];
    console.log('User found:', { id: user.id, is_verified: user.is_verified });
    
    if (user.is_verified) {
      console.log('User already verified');
      return res.status(400).json({ message: 'Already verified' });
    }

    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
    const expiresAt = new Date(Date.now() + (Number(process.env.VERIFICATION_TOKEN_EXPIRES_HOURS || 24) * 3600 * 1000));
    
    await pool.execute(
      'UPDATE users SET verification_token_hash = ?, verification_token_expires = ? WHERE id = ?', 
      [tokenHash, expiresAt, user.id]
    );

    console.log('Sending verification email to:', email);
    
    try {
      // Use the email helper
      await sendVerificationEmail(email, plainToken, user.id);
      console.log(`✅ Verification email sent successfully to: ${email}`);
      
      res.json({ 
        success: true,
        message: 'Verification email resent successfully' 
      });
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to send verification email. Please try again later.' 
      });
    }
    
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while sending verification email' 
    });
  }
});

/* Login (enforce verification) */
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

//     const [rows] = await pool.execute(
//       `SELECT u.id, u.email, u.password_hash, u.is_verified, u.company_id, u.role_id, r.role_name 
//        FROM users u 
//        LEFT JOIN roles r ON u.role_id = r.id 
//        WHERE u.email = ?`,
//       [email]
//     );
    
//     const user = rows[0];
//     if (!user) return res.status(401).json({ message: 'Invalid credentials' });
//     if (!user.is_verified) return res.status(403).json({ message: 'Please verify your email first' });

//     const ok = await bcrypt.compare(password, user.password_hash);
//     if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

//     const accessToken = signAccessToken(user);
//     const refreshToken = signRefreshToken(user);

//     await pool.execute('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user.id]);

//     // Use environment-aware cookie options
//     res.cookie('accessToken', accessToken, makeCookieOptions(1000 * 60 * 15)); // 15 min
//     res.cookie('refreshToken', refreshToken, makeCookieOptions(1000 * 60 * 60 * 24 * 7, isProd ? 'none' : 'strict')); // 7 days

//     res.json({ 
//       accessToken, 
//       user: { 
//         id: user.id, 
//         firstname: user.firstname,
//         email: user.email, 
//         role: user.role_name, 
//         role_id: user.role_id,
//         company_id: user.company_id 
//       } 
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error, Refresh the page' });
//   }
// });
/* Unified Login Route (handles both admin/employee and houseowner) */
router.post('/login-unified', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    // First, check if it's a regular user (admin/employee)
    const [users] = await pool.execute(
      `SELECT u.id, u.email, u.password_hash, u.is_verified, u.company_id, u.role_id, r.role_name, 
              u.firstname, u.is_active, 'user' as user_type
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.email = ?`,
      [email]
    );
    
    if (users.length > 0) {
      // This is a regular user (admin/employee)
      const user = users[0];
      
      if (!user.is_active) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }
      
      if (!user.is_verified) {
        return res.status(403).json({ message: 'Please verify your email first' });
      }

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

      const accessToken = jwt.sign({ 
        id: user.id, 
        firstname: user.firstname,
        email: user.email, 
        role: user.role_name || user.role,
        role_id: user.role_id,
        company_id: user.company_id,
        user_type: 'user'
      }, process.env.ACCESS_TOKEN_SECRET, { 
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      });

      const refreshToken = jwt.sign({ 
        id: user.id,
        user_type: 'user'
      }, process.env.REFRESH_TOKEN_SECRET, { 
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN 
      });

      await pool.execute('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user.id]);

      // Set cookies
      res.cookie('accessToken', accessToken, makeCookieOptions(1000 * 60 * 15));
      res.cookie('refreshToken', refreshToken, makeCookieOptions(1000 * 60 * 60 * 24 * 7, isProd ? 'none' : 'strict'));

      return res.json({ 
        accessToken, 
        user: { 
          id: user.id, 
          firstname: user.firstname,
          email: user.email, 
          role: user.role_name, 
          role_id: user.role_id,
          company_id: user.company_id,
          user_type: 'user'
        } 
      });
    }

    // If not found in users table, check houseowner table
    const [houseOwners] = await pool.execute(
      `SELECT id, email, password_hash, is_verified, is_active, name, apartment_id, company_id,
              'houseowner' as user_type
       FROM houseowner WHERE email = ?`,
      [email]
    );
    
    if (houseOwners.length > 0) {
      // This is a house owner
      const owner = houseOwners[0];
      
      if (!owner.is_active) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }

      if (!owner.is_verified) {
        return res.status(403).json({ message: 'Please verify your email first' });
      }

      // Check if password is set
      if (!owner.password_hash) {
        return res.status(403).json({ 
          message: 'Password not set. Please contact admin or use verification link.' 
        });
      }

      const ok = await bcrypt.compare(password, owner.password_hash);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

      const accessToken = jwt.sign({ 
        id: owner.id, 
        houseowner_id: owner.id,
        name: owner.name,
        email: owner.email,
        role: 'houseowner',
        apartment_id: owner.apartment_id,
        company_id: owner.company_id,
        user_type: 'houseowner'
      }, process.env.ACCESS_TOKEN_SECRET, { 
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      });

      const refreshToken = jwt.sign({ 
        id: owner.id,
        user_type: 'houseowner'
      }, process.env.REFRESH_TOKEN_SECRET, { 
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN 
      });

      // Update last login
      await pool.execute(
        'UPDATE houseowner SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [owner.id]
      );

      // Set cookies
      res.cookie('accessToken', accessToken, makeCookieOptions(1000 * 60 * 15));
      res.cookie('refreshToken', refreshToken, makeCookieOptions(1000 * 60 * 60 * 24 * 7, isProd ? 'none' : 'strict'));

      return res.json({ 
        accessToken, 
        user: { 
          id: owner.id, 
          name: owner.name,
          email: owner.email, 
          role: 'houseowner',
          apartment_id: owner.apartment_id,
          company_id: owner.company_id,
          user_type: 'houseowner'
        } 
      });
    }

    // If email not found in either table
    return res.status(401).json({ message: 'Invalid credentials' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error, Refresh the page and try again' });
  }
});

/* refresh token */
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (e) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const [rows] = await pool.execute(
      `SELECT u.id, u.refresh_token, u.email, u.company_id, r.role_name, u.role_id 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [payload.id]
    );
    
    const user = rows[0];
    if (!user || user.refresh_token !== token) return res.status(403).json({ message: 'Refresh token not valid' });

    const accessToken = signAccessToken(user);
    const newRefresh = signRefreshToken(user);
    await pool.execute('UPDATE users SET refresh_token = ? WHERE id = ?', [newRefresh, user.id]);

    // Set cookies with production-safe options
    res.cookie('refreshToken', newRefresh, makeCookieOptions(1000 * 60 * 60 * 24 * 7, isProd ? 'none' : 'strict'));
    res.cookie('accessToken', accessToken, makeCookieOptions(1000 * 60 * 15));

    res.json({ 
      accessToken, 
      user: { 
        id: user.id, 
        firstname: user.firstname,
        email: user.email, 
        role: user.role_name, 
        role_id: user.role_id,
        company_id: user.company_id 
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* logout */
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        await pool.execute('UPDATE users SET refresh_token = NULL WHERE id = ?', [payload.id]);
      } catch (e) { /* ignore invalid token */ }
    }
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: isProd ? 'none' : 'strict', secure: isProd, domain: COOKIE_DOMAIN });
    res.json({ message: 'Logged out' });
  } catch (err) {
    console.error(err);
    res.status(200).json({ message: 'Logged out' });
  }
});

//get users according to the company id
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const company_id = req.user.company_id;
    
    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    const [users] = await pool.execute(
      `SELECT 
        u.id, 
        u.firstname, 
        u.lastname, 
        u.email, 
        u.country,
        u.mobile,
        r.role_name as role,
        u.role_id,
        u.is_verified, 
        u.is_active,
        u.created_at 
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.company_id = ? 
       ORDER BY u.created_at DESC`,
      [company_id]
    );

    res.json({
      success: true,
      data: users
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 forgot password requests per windowMs
  message: 'Too many password reset attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 reset attempts per windowMs
  message: 'Too many reset attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Send password reset link
// router.post('/forgot-password', async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) return res.status(400).json({ message: 'Email is required' });

//     // find user
//     const [rows] = await pool.execute('SELECT id, email FROM users WHERE email = ?', [email]);
//     if (!rows.length) return res.status(404).json({ message: 'No account found with that email' });

//     const user = rows[0];

//     // generate reset token
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
//     const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

//     await pool.execute(
//       'UPDATE users SET reset_token_hash = ?, reset_token_expires = ? WHERE id = ?',
//       [resetTokenHash, expiresAt, user.id]
//     );

//     // Use email helper
//     await sendPasswordResetEmail(email, resetToken, user.id);
//     console.log(`Password reset email sent to: ${user.email}`);

//     res.json({ message: 'Password reset link sent to your email' });
//   } catch (err) {
//     console.error('Forgot password error:', err);
//     res.status(500).json({ message: 'Server error while sending reset link' });
//   }
// });

// // Reset password route
// router.post('/reset-password',resetPasswordLimiter, async (req, res) => {
//   try {
//     const { token, id, password } = req.body;
//     if (!token || !id || !password)
//       return res.status(400).json({ message: 'Token, ID, and new password are required' });

//     const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

//     const [rows] = await pool.execute(
//       'SELECT reset_token_hash, reset_token_expires FROM users WHERE id = ?',
//       [id]
//     );

//     if (!rows.length) return res.status(404).json({ message: 'User not found' });
//     const user = rows[0];

//     if (user.reset_token_hash !== tokenHash)
//       return res.status(400).json({ message: 'Invalid or already used token' });

//     if (new Date(user.reset_token_expires) < new Date())
//       return res.status(400).json({ message: 'Reset token expired' });

//     const hashedPassword = await bcrypt.hash(password, 12);

//     await pool.execute(
//       'UPDATE users SET password_hash = ?, reset_token_hash = NULL, reset_token_expires = NULL WHERE id = ?',
//       [hashedPassword, id]
//     );

//     res.json({ message: 'Password reset successful' });
//   } catch (err) {
//     console.error('Reset password error:', err);
//     res.status(500).json({ message: 'Server error while resetting password' });
//   }
// });

/* Unified Forgot Password Route */
router.post('/forgot-password-unified', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Check users table first
    const [users] = await pool.execute(
      'SELECT id, email, "user" as user_type FROM users WHERE email = ?',
      [email]
    );
    
    let userType = '';
    let userId = null;
    let userEmail = null;
    
    if (users.length > 0) {
      userType = 'user';
      userId = users[0].id;
      userEmail = users[0].email;
    } else {
      // Check houseowner table
      const [houseOwners] = await pool.execute(
        'SELECT id, email FROM houseowner WHERE email = ?',
        [email]
      );
      
      if (houseOwners.length > 0) {
        userType = 'houseowner';
        userId = houseOwners[0].id;
        userEmail = houseOwners[0].email;
      }
    }

    if (!userId) {
      return res.status(404).json({ message: 'No account found with that email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    if (userType === 'user') {
      await pool.execute(
        'UPDATE users SET reset_token_hash = ?, reset_token_expires = ? WHERE id = ?',
        [resetTokenHash, expiresAt, userId]
      );
    } else {
      await pool.execute(
        'UPDATE houseowner SET reset_token_hash = ?, reset_token_expires = ? WHERE id = ?',
        [resetTokenHash, expiresAt, userId]
      );
    }

    // Send email with user_type parameter
    await sendPasswordResetEmail(userEmail, resetToken, userId, userType);
    console.log(`Password reset email sent to: ${userEmail} (${userType})`);

    res.json({ message: 'Password reset link sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error while sending reset link' });
  }
});

/* Unified Reset Password Route */
router.post('/reset-password-unified', async (req, res) => {
  try {
    const { token, id, password, user_type } = req.body;
    if (!token || !id || !password || !user_type)
      return res.status(400).json({ message: 'All fields are required' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    if (user_type === 'user') {
      const [rows] = await pool.execute(
        'SELECT reset_token_hash, reset_token_expires FROM users WHERE id = ?',
        [id]
      );

      if (!rows.length) return res.status(404).json({ message: 'User not found' });
      const user = rows[0];

      if (user.reset_token_hash !== tokenHash)
        return res.status(400).json({ message: 'Invalid or already used token' });

      if (new Date(user.reset_token_expires) < new Date())
        return res.status(400).json({ message: 'Reset token expired' });

      const hashedPassword = await bcrypt.hash(password, 12);

      await pool.execute(
        'UPDATE users SET password_hash = ?, reset_token_hash = NULL, reset_token_expires = NULL WHERE id = ?',
        [hashedPassword, id]
      );
    } else if (user_type === 'houseowner') {
      const [rows] = await pool.execute(
        'SELECT reset_token_hash, reset_token_expires FROM houseowner WHERE id = ?',
        [id]
      );

      if (!rows.length) return res.status(404).json({ message: 'House owner not found' });
      const owner = rows[0];

      if (owner.reset_token_hash !== tokenHash)
        return res.status(400).json({ message: 'Invalid or already used token' });

      if (new Date(owner.reset_token_expires) < new Date())
        return res.status(400).json({ message: 'Reset token expired' });

      const hashedPassword = await bcrypt.hash(password, 12);

      await pool.execute(
        'UPDATE houseowner SET password_hash = ?, reset_token_hash = NULL, reset_token_expires = NULL WHERE id = ?',
        [hashedPassword, id]
      );
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error while resetting password' });
  }
});

/* Check reset token (for validation) */
router.post('/check-reset-token', async (req, res) => {
  try {
    const { token, id } = req.body;
    
    if (!token || !id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token and ID are required' 
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Check users table
    const [users] = await pool.execute(
      'SELECT id, email, reset_token_expires FROM users WHERE id = ? AND reset_token_hash = ?',
      [id, tokenHash]
    );

    if (users.length > 0) {
      const user = users[0];
      
      // Check if token is expired
      if (new Date(user.reset_token_expires) < new Date()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Reset token expired' 
        });
      }

      return res.json({
        success: true,
        user_type: 'user',
        email: user.email
      });
    }

    // If not found in users table, check houseowner table
    const [houseOwners] = await pool.execute(
      'SELECT id, email, reset_token_expires FROM houseowner WHERE id = ? AND reset_token_hash = ?',
      [id, tokenHash]
    );

    if (houseOwners.length > 0) {
      const owner = houseOwners[0];
      
      if (new Date(owner.reset_token_expires) < new Date()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Reset token expired' 
        });
      }

      return res.json({
        success: true,
        user_type: 'houseowner',
        email: owner.email
      });
    }

    return res.status(404).json({ 
      success: false, 
      message: 'Invalid reset token' 
    });

  } catch (err) {
    console.error('Check reset token error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while verifying reset token' 
    });
  }
});

//user invite
router.post('/invite', authenticateToken, async (req, res) => {
  try {
    const { email, role_id } = req.body; // Now using role_id instead of role name
    const company_id = req.user.company_id; 

    if (!email || !role_id) {
      return res.status(400).json({ message: 'Email and role are required' });
    }

    if (!company_id) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    // Check if user already exists
    const [exists] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Verify the role exists and belongs to company
    const [roleCheck] = await pool.execute(
      'SELECT role_name FROM roles WHERE id = ? AND company_id = ? AND is_active = 1',
      [role_id, company_id]
    );

    if (!roleCheck.length) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const role_name = roleCheck[0].role_name;

    // Insert invited user with role_id
    const [ins] = await pool.execute(
      'INSERT INTO users (email, role_id, is_verified, is_active, company_id, password_hash) VALUES (?, ?, 0, 1, ?, NULL)',
      [email, role_id, company_id]
    );

    const userId = ins.insertId;

    // Generate verification token
    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await pool.execute(
      'UPDATE users SET verification_token_hash=?, verification_token_expires=? WHERE id=?',
      [tokenHash, expiresAt, userId]
    );

    // Use email helper with role_name
    await sendInvitationEmail(email, plainToken, userId, role_name);
    console.log(`Invite email sent to: ${email}`);

    res.status(201).json({ message: 'Invitation sent successfully' });
  } catch (err) {
    console.error('Invite error:', err);
    res.status(500).json({ message: 'Server error while inviting user' });
  }
});

// Add this route to your auth.js before the complete-registration route
router.post('/verify-invite-link', async (req, res) => {
  try {
    const { token, id } = req.body;
    if (!token || !id) return res.status(400).json({ message: 'Invalid request' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const [rows] = await pool.execute(
      'SELECT id, email, verification_token_hash, verification_token_expires, is_verified FROM users WHERE id = ?',
      [id]
    );
    
    if (!rows.length) return res.status(400).json({ message: 'Invalid invitation link' });

    const user = rows[0];
    
    // Check if already verified
    if (user.is_verified) {
      return res.status(400).json({ message: 'This invitation has already been used' });
    }

    // Check token validity
    if (!user.verification_token_hash || user.verification_token_hash !== tokenHash) {
      return res.status(400).json({ message: 'Invalid invitation token' });
    }

    // Check expiration
    if (new Date(user.verification_token_expires) < new Date()) {
      return res.status(400).json({ message: 'Invitation link has expired' });
    }

    res.json({ 
      success: true, 
      email: user.email,
      message: 'Invitation link is valid' 
    });
    
  } catch (err) {
    console.error('Verify invite error:', err);
    res.status(500).json({ message: 'Server error while verifying invitation' });
  }
});

//complete-registration of users by themselves 
router.post('/complete-registration', async (req, res) => {
  try {
    const { email, firstname, lastname, country, mobile, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const [users] = await pool.execute(
      `SELECT u.id, u.is_verified, u.role_id, r.role_name 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.email = ?`,
      [email]
    );
    
    if (!users.length) return res.status(404).json({ message: 'User not found' });

    const user = users[0];
    
    // Check if user is already verified and has completed registration
    if (user.is_verified) {
      // Check if they already have a password (completed registration)
      const [userDetails] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [user.id]);
      if (userDetails[0].password_hash) {
        return res.status(400).json({ message: 'Registration already completed' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await pool.execute(
      `UPDATE users 
       SET firstname=?, lastname=?, country=?, mobile=?, password_hash=?, is_verified=1, is_active=1 
       WHERE id=?`,
      [firstname, lastname, country, mobile, hashedPassword, user.id]
    );

    res.json({ 
      message: 'Registration completed successfully',
      user: {
        id: user.id,
        email: email,
        role: user.role_name,
        role_id: user.role_id
      }
    });
  } catch (err) {
    console.error('Complete registration error:', err);
    res.status(500).json({ message: 'Server error while completing registration' });
  }
});

// Update user
router.put('/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_type = req.user.user_type || 'user';
    
    if (user_type === 'houseowner') {
      // Update house owner profile
      const { name, country, mobile, nic, occupation } = req.body;
      const requesting_user_id = req.user.id;
      
      console.log('Updating house owner profile:', { id, requesting_user_id, name });
      
      // Verify that the authenticated house owner is updating their OWN profile
      if (id !== requesting_user_id) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only update your own profile' 
        });
      }
      
      // Check if house owner exists
      const [owners] = await pool.execute(
        'SELECT id, email, mobile FROM houseowner WHERE id = ?',
        [id]
      );
      
      if (!owners.length) {
        return res.status(404).json({ 
          success: false, 
          message: 'House owner not found' 
        });
      }
      
      const existingOwner = owners[0];
      
      // Check if mobile is already taken by another house owner
      if (mobile && mobile !== existingOwner.mobile) {
        const [existingMobile] = await pool.execute(
          'SELECT id FROM houseowner WHERE mobile = ? AND id != ?',
          [mobile, id]
        );
        if (existingMobile.length) {
          return res.status(409).json({ 
            success: false, 
            message: 'Mobile number already taken' 
          });
        }
      }
      
      // Build update query
      let updateQuery = 'UPDATE houseowner SET ';
      const queryParams = [];
      const updates = [];
      
      if (name !== undefined) {
        updates.push('name = ?');
        queryParams.push(name);
      }
      
      if (country !== undefined) {
        updates.push('country = ?');
        queryParams.push(country);
      }
      
      if (mobile !== undefined) {
        updates.push('mobile = ?');
        queryParams.push(mobile);
      }
      
      if (nic !== undefined) {
        updates.push('nic = ?');
        queryParams.push(nic);
      }
      
      if (occupation !== undefined) {
        updates.push('occupation = ?');
        queryParams.push(occupation);
      }
      
      if (updates.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No fields to update' 
        });
      }
      
      updates.push('updated_at = NOW()');
      
      updateQuery += updates.join(', ') + ' WHERE id = ?';
      queryParams.push(id);
      
      console.log('Executing query:', updateQuery, 'with params:', queryParams);
      
      await pool.execute(updateQuery, queryParams);
      
      // Get updated data
      const [updatedOwner] = await pool.execute(
        `SELECT 
          ho.id, 
          ho.name,
          ho.email,
          ho.country,
          ho.mobile,
          ho.nic,
          ho.occupation,
          'houseowner' as role,
          ho.is_verified, 
          ho.is_active,
          ho.created_at,
          ho.updated_at,
          ho.apartment_id,
          a.name as apartment_name,
          h.houseowner_id,
          h.house_id as house_number,
          f.floor_id as floor_number
         FROM houseowner ho
         LEFT JOIN apartments a ON ho.apartment_id = a.id
         LEFT JOIN houses h ON ho.id = h.houseowner_id
         LEFT JOIN floors f ON h.floor_id = f.id
         WHERE ho.id = ?`,
        [id]
      );
      
      if (updatedOwner.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Updated house owner not found' 
        });
      }
      
      const owner = updatedOwner[0];
      
      // Split name for frontend compatibility
      const nameParts = owner.name ? owner.name.split(' ') : ['', ''];
      const firstname = nameParts[0] || '';
      const lastname = nameParts.slice(1).join(' ') || '';
      
      const responseData = {
        id: owner.id,
        firstname: firstname,
        lastname: lastname,
        name: owner.name,
        email: owner.email,
        country: owner.country,
        mobile: owner.mobile,
        nic: owner.nic,
        occupation: owner.occupation,
        role: owner.role,
        is_verified: owner.is_verified,
        is_active: owner.is_active,
        created_at: owner.created_at,
        updated_at: owner.updated_at,
        apartment_id: owner.apartment_id,
        apartment_name: owner.apartment_name,
        houseowner_id: owner.houseowner_id,
        house_number: owner.house_number,
        floor_number: owner.floor_number,
        user_type: 'houseowner'
      };
      
      return res.json({
        success: true,
        message: 'Profile updated successfully',
        data: responseData
      });
    } else {
      const { id } = req.params;
    const { firstname, lastname, email, country, mobile, role_id, password } = req.body;
    
    // Check if user exists
    const [users] = await pool.execute(
      `SELECT u.id, u.company_id, u.email as current_email, r.role_name 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [id]
    );
    
    if (!users.length) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];
    
    // Check if user belongs to the same company
    if (user.company_id !== req.user.company_id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.current_email) {
      const [existing] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ? AND company_id = ?',
        [email, id, req.user.company_id]
      );
      if (existing.length) {
        return res.status(409).json({ success: false, message: 'Email already taken' });
      }
    }

    // If role_id is provided, verify it belongs to company
    if (role_id) {
      const [roleCheck] = await pool.execute(
        'SELECT id, role_name FROM roles WHERE id = ? AND company_id = ? AND is_active = 1',
        [role_id, req.user.company_id]
      );
      if (!roleCheck.length) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }
    }

    let updateQuery = `
      UPDATE users SET 
      firstname = ?, lastname = ?, country = ?, mobile = ?
    `;
    let queryParams = [firstname, lastname, country, mobile];

    // Add role_id to update
    if (role_id) {
      updateQuery += ', role_id = ?';
      queryParams.push(role_id);
    }

    // Add email to update
    if (email) {
      updateQuery += ', email = ?';
      queryParams.push(email);
    }

    // Password and verification logic
    if (password) {
      const password_hash = await bcrypt.hash(password, 12);
      updateQuery += ', password_hash = ?';
      queryParams.push(password_hash);
      
      if (email && email !== user.current_email) {
        updateQuery += ', is_verified = 0';
      }
    } else {
      if (email && email !== user.current_email) {
        updateQuery += ', is_verified = 0';
      }
    }

    updateQuery += ' WHERE id = ?';
    queryParams.push(id);

    await pool.execute(updateQuery, queryParams);

    // Get updated user data with role name
    const [updatedUser] = await pool.execute(
      `SELECT u.*, r.role_name 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [id]
    );

    const userData = updatedUser[0];

    const responseData = { 
      id, 
      firstname, 
      lastname, 
      country, 
      mobile,
      role_id: userData.role_id,
      role: userData.role_name
    };

    if (email && email !== user.current_email) {
      responseData.email = email;
      responseData.requires_verification = true;
    } else {
      responseData.email = user.current_email;
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: responseData
    });
    }
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ success: false, message: 'Server error while updating user' });
  }
});

// Toggle user active status
router.patch('/users/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists and belongs to same company
    const [users] = await pool.execute(
      'SELECT id, company_id, is_active FROM users WHERE id = ? AND company_id = ?',
      [id, req.user.company_id]
    );
    
    if (!users.length) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];
    const newStatus = !user.is_active;

    await pool.execute(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [newStatus, id]
    );

    res.json({
      success: true,
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: { is_active: newStatus }
    });

  } catch (err) {
    console.error('Error toggling user:', err);
    res.status(500).json({ success: false, message: 'Server error while updating user status' });
  }
});

// Delete user
router.delete('/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists and belongs to same company
    const [users] = await pool.execute(
      'SELECT id, company_id, email FROM users WHERE id = ? AND company_id = ?',
      [id, req.user.company_id]
    );
    
    if (!users.length) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];
    
    // Prevent user from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    // Delete the user
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, message: 'Server error while deleting user' });
  }
});

// router.get('/me', authenticateToken, async (req, res) => {
//   try {
//     const user_id = req.user.id;
    
//     // if (!company_id) {
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: 'Company ID is required'
//     //   });
//     // }

//     const [users] = await pool.execute(
//        `SELECT 
//         u.id, 
//         u.firstname, 
//         u.lastname, 
//         u.email,
//         u.country,
//         u.mobile,
//         r.role_name as role,
//         u.role_id,
//         u.is_verified, 
//         u.is_active,
//         u.created_at
//        FROM users u
//        LEFT JOIN roles r ON u.role_id = r.id
//        WHERE u.id = ?`,
//       [user_id]
//     );

//       if (!users.length) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     const user = users[0];

//     res.json({
//       success: true,
//       data: users
//     });
//   } catch (err) {
//     console.error('Get user error:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch user'
//     });
//   }
// });
// Update the /me endpoint in auth.js to handle both user types properly
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const user_type = req.user.user_type || 'user'; // Get user_type from token
    
    console.log('Fetching profile for:', { user_id, user_type, user_data: req.user });
    
    let userData = null;
    
    if (user_type === 'houseowner') {
      // Fetch house owner data
      const [houseOwners] = await pool.execute(
        `SELECT 
          ho.id, 
          ho.name,
          ho.email,
          ho.country,
          ho.mobile,
          ho.nic,
          ho.occupation,
          'houseowner' as role,
          ho.is_verified, 
          ho.is_active,
          ho.created_at,
          ho.updated_at,
          ho.apartment_id,
          a.name as apartment_name,
          h.houseowner_id,
          h.house_id as house_number,
          f.floor_id as floor_number
         FROM houseowner ho
         LEFT JOIN apartments a ON ho.apartment_id = a.id
         LEFT JOIN houses h ON ho.id = h.houseowner_id
         LEFT JOIN floors f ON h.floor_id = f.id
         WHERE ho.id = ?`,
        [user_id]
      );
      
      if (houseOwners.length > 0) {
        const owner = houseOwners[0];
        userData = {
          id: owner.id,
          firstname: owner.name ? owner.name.split(' ')[0] : '', // For compatibility
          lastname: owner.name ? owner.name.split(' ').slice(1).join(' ') : '', // For compatibility
          name: owner.name,
          email: owner.email,
          country: owner.country,
          mobile: owner.mobile,
          nic: owner.nic,
          occupation: owner.occupation,
          role: owner.role,
          is_verified: owner.is_verified,
          is_active: owner.is_active,
          created_at: owner.created_at,
          updated_at: owner.updated_at,
          apartment_id: owner.apartment_id,
          apartment_name: owner.apartment_name,
          houseowner_id: owner.houseowner_id,
          house_number: owner.house_number,
          floor_number: owner.floor_number,
          user_type: 'houseowner'
        };
      }
    } else {
      // Fetch regular user data
      const [users] = await pool.execute(
        `SELECT 
          u.id, 
          u.firstname, 
          u.lastname, 
          u.email,
          u.country,
          u.mobile,
          r.role_name as role,
          u.role_id,
          u.is_verified, 
          u.is_active,
          u.created_at
         FROM users u
         LEFT JOIN roles r ON u.role_id = r.id
         WHERE u.id = ?`,
        [user_id]
      );
      
      if (users.length > 0) {
        const user = users[0];
        userData = {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          name: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
          email: user.email,
          country: user.country,
          mobile: user.mobile,
          role: user.role,
          role_id: user.role_id,
          is_verified: user.is_verified,
          is_active: user.is_active,
          created_at: user.created_at,
          user_type: 'user'
        };
      }
    }
    
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: [userData] // Keep as array for backward compatibility
    });
    
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
});

module.exports=router;