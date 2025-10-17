// routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {authenticateToken} = require('../middleware/auth')
const { sendVerificationEmail } = require('../helpers/email');
require('dotenv').config();

// helpers for JWT
function signAccessToken(user) {
  return jwt.sign({ 
    id: user.id, 
    email: user.email, 
    role: user.role,
    company_id:user.company_id
   }, 
    process.env.ACCESS_TOKEN_SECRET, 
    { 
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
      'INSERT INTO users (firstname, lastname, country, mobile, email, password_hash, is_verified, is_active,company_id) VALUES (?, ?, ?, ?, ?, ?, 0, 1, ?)',
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

    // create verification token (plain->email, hash->DB)
    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
    const expiresAt = new Date(Date.now() + (Number(process.env.VERIFICATION_TOKEN_EXPIRES_HOURS || 24) * 3600 * 1000));

    await pool.execute('UPDATE users SET verification_token_hash = ?, verification_token_expires = ? WHERE id = ?', [tokenHash, expiresAt, userId]);

    // send verification email
    await sendVerificationEmail(email, plainToken, userId);

    res.status(201).json({ message: 'User registered, check email to verify' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* Verify: frontend reads token&id from query and POSTs to /verify */
router.post('/verify', async (req, res) => {
  try {
    const { token, id } = req.body;
    if (!token || !id) return res.status(400).json({ message: 'Invalid request' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const [rows] = await pool.execute('SELECT verification_token_hash, verification_token_expires, is_verified FROM users WHERE id = ?', [id]);
    if (!rows.length) return res.status(400).json({ message: 'Invalid verification link' });

    const user = rows[0];
    if (user.is_verified) return res.status(200).json({ message: 'Already verified' });

    if (!user.verification_token_hash || user.verification_token_hash !== tokenHash) {
      return res.status(400).json({ message: 'Invalid token' });
    }
    if (new Date(user.verification_token_expires) < new Date()) {
      return res.status(400).json({ message: 'Token expired' });
    }

    await pool.execute('UPDATE users SET is_verified = 1, verification_token_hash = NULL, verification_token_expires = NULL WHERE id = ?', [id]);
    return res.json({ message: 'Email verified' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/* Resend verification (rate-limit this from main server) */
router.post('/resend', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const [rows] = await pool.execute('SELECT id, is_verified FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });

    const user = rows[0];
    if (user.is_verified) return res.status(400).json({ message: 'Already verified' });

    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
    const expiresAt = new Date(Date.now() + (Number(process.env.VERIFICATION_TOKEN_EXPIRES_HOURS || 24) * 3600 * 1000));
    await pool.execute('UPDATE users SET verification_token_hash = ?, verification_token_expires = ? WHERE id = ?', [tokenHash, expiresAt, user.id]);

    await sendVerificationEmail(email, plainToken, user.id);
    res.json({ message: 'Verification email resent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* Login (enforce verification) */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const [rows] = await pool.execute('SELECT id, email, password_hash, is_verified, role, company_id FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.is_verified) return res.status(403).json({ message: 'Please verify your email first' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    await pool.execute('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user.id]);

    // NEW: send it in a cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    sameSite: 'lax',   // adjust if you have cross-site frontend/backend
    secure: false      // set to true if using HTTPS
  });


    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    res.json({ accessToken, user: { id: user.id, email: user.email, role: user.role, company_id:user.company_id} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
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

    const [rows] = await pool.execute('SELECT id, refresh_token, email, role FROM users WHERE id = ?', [payload.id]);
    const user = rows[0];
    if (!user || user.refresh_token !== token) return res.status(403).json({ message: 'Refresh token not valid' });

    const accessToken = signAccessToken(user);
    const newRefresh = signRefreshToken(user);
    await pool.execute('UPDATE users SET refresh_token = ? WHERE id = ?', [newRefresh, user.id]);

    res.cookie('refreshToken', newRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    res.json({ accessToken, user: { id: user.id, email: user.email, role: user.role, company_id:user.company_id} });
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
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
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

    // Get users (excluding password and other sensitive info)
    const [users] = await pool.execute(
      `SELECT 
        id, 
        firstname, 
        lastname, 
        email, 
        country,
        mobile,
        role, 
        is_verified, 
        is_active,
        created_at 
       FROM users 
       WHERE company_id = ? 
       ORDER BY created_at DESC`,
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
// In your auth.js routes file
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // find user
    const [rows] = await pool.execute('SELECT id, email FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(404).json({ message: 'No account found with that email' });

    const user = rows[0];

    // generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await pool.execute(
      'UPDATE users SET reset_token_hash = ?, reset_token_expires = ? WHERE id = ?',
      [resetTokenHash, expiresAt, user.id]
    );

    // Debug: Check if email credentials are loaded
    console.log('Email User:', process.env.SMTP_USER);
    console.log('Email Pass:', process.env.SMTP_PASS ? '***' : 'MISSING');

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('Email credentials missing from environment variables');
      return res.status(500).json({ message: 'Email service not configured' });
    }

    // Create transporter with better configuration
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Add these options for better reliability
      pool: true,
      maxConnections: 1,
      rateDelta: 20000,
      rateLimit: 5
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log('Email transporter verified successfully');
    } catch (verifyError) {
      console.error('Email transporter verification failed:', verifyError);
      return res.status(500).json({ message: 'Email service configuration error' });
    }

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&id=${user.id}`;

    const mailOptions = {
      from: {
        name: 'AptSync Support',
        address: process.env.SMTP_USER
      },
      to: user.email,
      subject: 'Reset your AptSync password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6d28d9;">Password Reset Request</h2>
          <p>You requested to reset your password for AptSync.</p>
          <p>Click the button below to reset your password. This link will expire in 15 minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #6d28d9; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you didn't request this, please ignore this email.
          </p>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link in your browser:<br>
            <code style="background: #f5f5f5; padding: 5px; border-radius: 3px;">${resetUrl}</code>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to: ${user.email}`);

    res.json({ message: 'Password reset link sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    
    // More specific error messages
    if (err.code === 'EAUTH') {
      return res.status(500).json({ message: 'Email authentication failed. Please check email configuration.' });
    }
    
    res.status(500).json({ message: 'Server error while sending reset link' });
  }
});


// ✅ Reset password route
router.post('/reset-password',resetPasswordLimiter, async (req, res) => {
  try {
    const { token, id, password } = req.body;
    if (!token || !id || !password)
      return res.status(400).json({ message: 'Token, ID, and new password are required' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

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

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error while resetting password' });
  }
});


module.exports = router;
