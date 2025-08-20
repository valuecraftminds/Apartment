// helpers/email.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// optional verify on startup
async function verifyTransport() {
  try {
    await transporter.verify();
    console.log('✅ SMTP transporter verified');
  } catch (e) {
    console.warn('⚠️ SMTP verify failed:', e.message);
  }
}

async function sendVerificationEmail(toEmail, plainToken, userId) {
  const loginUrl = `${process.env.FRONTEND_URL}/login?token=${plainToken}&id=${userId}`;
  const html = `
    <h3>Welcome to AptSync</h3>
    <p>Please verify your email by clicking the button below. This link expires in ${process.env.VERIFICATION_TOKEN_EXPIRES_HOURS || 24} hours.</p>
    <p><a href="${loginUrl}" style="display:inline-block;padding:10px 18px;background:#6b46c1;color:#fff;border-radius:6px;text-decoration:none">Verify Email</a></p>
    <p>If the button doesn't work, copy/paste this URL into your browser:<br/><code>${loginUrl}</code></p>
  `;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: 'Verify your email — AptSync',
    html
  });
}

module.exports = { transporter, sendVerificationEmail, verifyTransport };
