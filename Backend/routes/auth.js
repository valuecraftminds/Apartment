// routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../helpers/email');
require('dotenv').config();

// helpers for JWT
function signAccessToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN });
}
function signRefreshToken(user) {
  return jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });
}

/* Register: create user, store hashed verification token, send email */
router.post('/register', async (req, res) => {
  try {
    const { firstname, lastname, username, country, mobile, email, password, company_id } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const [exists] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length) return res.status(409).json({ message: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 12);
    
    // FIXED: Handle company_id properly - convert undefined to null
    const [ins] = await pool.execute(
      'INSERT INTO users (firstname, lastname, username, country, mobile, email, password_hash, is_verified, company_id) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)',
      [
        firstname || null, 
        lastname || null, 
        username || null, // Handle username if it's undefined
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

    const [rows] = await pool.execute('SELECT id, email, password_hash, is_verified, role FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.is_verified) return res.status(403).json({ message: 'Please verify your email first' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    await pool.execute('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user.id]);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    res.json({ accessToken, user: { id: user.id, email: user.email, role: user.role } });
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

    res.json({ accessToken, user: { id: user.id, email: user.email, role: user.role } });
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

module.exports = router;
