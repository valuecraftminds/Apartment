// routes/houseOwnerAuth.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail: sendUserVerificationEmail, sendPasswordResetEmail, sendHouseOwnerVerificationEmail } = require('../helpers/email');
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

function signAccessToken(owner) {
  return jwt.sign({ 
    id: owner.id, 
    houseowner_id: owner.id,
    name: owner.name,
    email: owner.email,
    role: 'houseowner',
    apartment_id: owner.apartment_id,
    company_id: owner.company_id
  }, process.env.ACCESS_TOKEN_SECRET, { 
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
  });
}

function signRefreshToken(owner) {
  return jwt.sign({ 
    id: owner.id,
    role: 'houseowner'
  }, process.env.REFRESH_TOKEN_SECRET, { 
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN 
  });
}
router.get('/health-check', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'House owner auth route is working',
    timestamp: new Date().toISOString()
  });
});

/* Admin sets password and sends verification email */
router.post('/admin/setup', async (req, res) => {
  try {
    const { houseowner_id, send_email = true } = req.body;
    
    if (!houseowner_id ) {
      return res.status(400).json({ 
        success: false, 
        message: 'House owner ID and password are required' 
      });
    }

    // Find house owner
    const [rows] = await pool.execute(
      'SELECT id, email, name, is_verified FROM houseowner WHERE id = ?',
      [houseowner_id]
    );
    
    if (!rows.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'House owner not found' 
      });
    }

    const owner = rows[0];
    
    // // Hash password
    // const password_hash = await bcrypt.hash(password, 12);
    
    // Generate verification token if not already verified
    let plainToken = null;
    let tokenHash = null;
    let expiresAt = null;
    
    if (send_email && !owner.is_verified) {
      plainToken = crypto.randomBytes(32).toString('hex');
      tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    // Update house owner with password and verification token
    await pool.execute(
      `UPDATE houseowner 
      SET is_verified = ?,
          verification_token_hash = ?,
          verification_token_expires = ?,
          is_active = 1
      WHERE id = ?`,
      [
        owner.is_verified ? 1 : 0,
        tokenHash,
        expiresAt,
        houseowner_id
      ]
    );

    // Send verification email if requested
    if (send_email && !owner.is_verified && plainToken) {
      try {
        await sendHouseOwnerVerificationEmail(owner.email, plainToken, owner.id);
        console.log(`✅ Verification email sent to house owner: ${owner.email}`);
      } catch (emailError) {
        console.error('Failed to send email:', emailError.message);
        // Continue even if email fails - password is still set
      }
    }

    res.json({
      success: true,
      message: owner.is_verified 
        ? 'Password set successfully. Owner can now login.'
        : 'Password set and verification email sent.',
      data: {
        id: owner.id,
        email: owner.email,
        is_verified: owner.is_verified,
        requires_verification: !owner.is_verified
      }
    });

  } catch (err) {
    console.error('Admin setup error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while setting up house owner' 
    });
  }
});


/* House owner verify email */
router.post('/verify', async (req, res) => {
  try {
    const { token, id } = req.body;
    
    if (!token || !id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token and ID are required' 
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const [rows] = await pool.execute(
      'SELECT id, email, verification_token_hash, verification_token_expires, is_verified FROM houseowner WHERE id = ?',
      [id]
    );
    
    if (!rows.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification link' 
      });
    }

    const owner = rows[0];

    if (owner.is_verified) {
      return res.status(200).json({ 
        success: true, 
        message: 'Already verified',
        requires_password: !owner.password_hash, // Check if password is already set
        owner_id: owner.id
      });
    }

    if (!owner.verification_token_hash) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    if (owner.verification_token_hash !== tokenHash) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    if (new Date(owner.verification_token_expires) < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }

    // Mark as verified but don't clear tokens yet (we'll use them for password setup)
    await pool.execute(
      'UPDATE houseowner SET is_verified = 1 WHERE id = ?',
      [id]
    );
    
    console.log(`✅ House owner verified: ${owner.email}`);
    
    return res.json({ 
      success: true, 
      message: 'Email verified successfully. You can now set your password.',
      requires_password: true,
      owner_id: owner.id,
      email: owner.email
    });
    
  } catch (err) {
    console.error('House owner verification error:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during verification' 
    });
  }
});

/* House owner set initial password after verification */
router.post('/setup-password', async (req, res) => {
  try {
    const { token, id, password } = req.body;
    
    if (!token || !id || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token, ID, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Verify the token is still valid
    const [rows] = await pool.execute(
      'SELECT id, email, verification_token_hash, verification_token_expires, is_verified, password_hash FROM houseowner WHERE id = ?',
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'House owner not found' 
      });
    }

    const owner = rows[0];

    // Check if already has password
    if (owner.password_hash) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password already set. Please use forgot password if needed.' 
      });
    }

    if (!owner.verification_token_hash) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    if (owner.verification_token_hash !== tokenHash) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    if (new Date(owner.verification_token_expires) < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }

    if (!owner.is_verified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please verify your email first' 
      });
    }

    // Hash and save password
    const password_hash = await bcrypt.hash(password, 12);

    // Clear verification tokens and set password
    await pool.execute(
      `UPDATE houseowner 
      SET password_hash = ?, 
          verification_token_hash = NULL,
          verification_token_expires = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [password_hash, id]
    );

    console.log(`✅ Password set for house owner: ${owner.email}`);
    
    res.json({ 
      success: true, 
      message: 'Password set successfully! You can now login.' 
    });
    
  } catch (err) {
    console.error('Setup password error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while setting password' 
    });
  }
});

/* House owner login */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password required' 
      });
    }

    const [rows] = await pool.execute(
      `SELECT id, email, password_hash, is_verified, is_active, name, apartment_id, company_id 
       FROM houseowner WHERE email = ?`,
      [email]
    );
    
    const owner = rows[0];
    
    if (!owner) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    if (!owner.is_active) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is deactivated' 
      });
    }

    if (!owner.is_verified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Please verify your email first' 
      });
    }

    // Check if password is set
    if (!owner.password_hash) {
      return res.status(403).json({ 
        success: false, 
        message: 'Password not set. Please contact admin.' 
      });
    }

    const ok = await bcrypt.compare(password, owner.password_hash);
    if (!ok) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const accessToken = signAccessToken(owner);
    const refreshToken = signRefreshToken(owner);

    // Store refresh token (optional - you might want a separate table for this)
    await pool.execute(
      'UPDATE houseowner SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [owner.id]
    );

    // Set cookies
    res.cookie('accessToken', accessToken, makeCookieOptions(1000 * 60 * 15)); // 15 min
    res.cookie('refreshToken', refreshToken, makeCookieOptions(1000 * 60 * 60 * 24 * 7, isProd ? 'none' : 'strict')); // 7 days

    res.json({ 
      success: true,
      accessToken, 
      owner: { 
        id: owner.id, 
        name: owner.name,
        email: owner.email, 
        role: 'houseowner',
        apartment_id: owner.apartment_id,
        company_id: owner.company_id
      } 
    });
    
  } catch (err) {
    console.error('House owner login error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/* Resend verification email */
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email required' 
      });
    }

    const [rows] = await pool.execute(
      'SELECT id, email, is_verified FROM houseowner WHERE email = ?',
      [email]
    );
    
    if (!rows.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'House owner not found' 
      });
    }

    const owner = rows[0];
    
    if (owner.is_verified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already verified' 
      });
    }

    // Generate new verification token
    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await pool.execute(
      'UPDATE houseowner SET verification_token_hash = ?, verification_token_expires = ? WHERE id = ?',
      [tokenHash, expiresAt, owner.id]
    );

    // Send email
    await sendHouseOwnerVerificationEmail(owner.email, plainToken, owner.id);
    
    res.json({ 
      success: true, 
      message: 'Verification email resent' 
    });
    
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while sending verification email' 
    });
  }
});

/* Forgot password */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const [rows] = await pool.execute(
      'SELECT id, email, is_verified FROM houseowner WHERE email = ? AND is_active = 1',
      [email]
    );
    
    if (!rows.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'No account found with that email' 
      });
    }

    const owner = rows[0];
    
    if (!owner.is_verified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please verify your email first' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await pool.execute(
  'UPDATE houseowner SET reset_token_hash = ?, reset_token_expires = ? WHERE id = ?',
  [resetTokenHash, expiresAt, owner.id]
);

    // Use your email helper
    await sendPasswordResetEmail(owner.email, resetToken, owner.id);
    
    res.json({ 
      success: true, 
      message: 'Password reset link sent to your email' 
    });
    
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while sending reset link' 
    });
  }
});

/* Reset password */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, id, password } = req.body;
    
    if (!token || !id || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token, ID, and new password are required' 
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const [rows] = await pool.execute(
      'SELECT reset_token_hash, reset_token_expires FROM houseowner WHERE id = ?',
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'House owner not found' 
      });
    }

    const owner = rows[0];

    if (owner.reset_token_hash !== tokenHash) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or already used token' 
      });
    }

    if (new Date(owner.reset_token_expires) < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reset token expired' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await pool.execute(
      'UPDATE houseowner SET password_hash = ?, reset_token_hash = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, id]
    );

    res.json({ 
      success: true, 
      message: 'Password reset successful' 
    });
    
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while resetting password' 
    });
  }
});

/* Get house owner profile */
router.get('/profile', async (req, res) => {
  try {
    // You'll need middleware to extract houseowner from JWT
    // For now, this is a placeholder
    res.json({ 
      success: true, 
      message: 'Profile endpoint - implement with authentication middleware' 
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/* Logout */
router.post('/logout', async (req, res) => {
  try {
    res.clearCookie('refreshToken', { 
      httpOnly: true, 
      sameSite: isProd ? 'none' : 'strict', 
      secure: isProd, 
      domain: COOKIE_DOMAIN 
    });
    res.clearCookie('accessToken', { 
      httpOnly: true, 
      sameSite: isProd ? 'none' : 'strict', 
      secure: isProd, 
      domain: COOKIE_DOMAIN 
    });
    
    res.json({ 
      success: true, 
      message: 'Logged out' 
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(200).json({ 
      success: true, 
      message: 'Logged out' 
    });
  }
});

// Add this to your routes/houseOwnerAuth.js or routes/houseOwner.js
router.get('/debug-token', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    res.json({ 
      success: true, 
      decoded: decoded,
      keys: Object.keys(decoded)
    });
  } catch (err) {
    res.status(403).json({ 
      success: false, 
      message: 'Invalid token',
      error: err.message 
    });
  }
});

module.exports = router;