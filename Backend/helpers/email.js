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
    <p>Please verify your email by clicking the button below.</p>
    <p><a href="${loginUrl}" style="display:inline-block;padding:10px 18px;background:#6b46c1;color:#fff;border-radius:6px;text-decoration:none">Verify Email</a></p>
  `;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: 'Verify your email — AptSync',
    html
  };

  // Add retry logic with delays
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      if (retryCount > 0) {
        // Add delay between retries (1s, 2s, 4s - exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
        console.log(`Retry attempt ${retryCount} for email: ${toEmail}`);
      }
      
      await transporter.sendMail(mailOptions);
      console.log(`✅ Verification email sent to: ${toEmail}`);
      return true;
      
    } catch (error) {
      retryCount++;
      console.error(`❌ Failed to send email to ${toEmail} (attempt ${retryCount}):`, error.message);
      
      if (retryCount === maxRetries) {
        console.error(`💥 Final failure for email: ${toEmail}`);
        throw new Error(`Failed to send verification email after ${maxRetries} attempts`);
      }
    }
  }
}

// Send password reset email
async function sendPasswordResetEmail(toEmail, resetToken, userId) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&id=${userId}`;
  
  const html = `
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
  `;

  const mailOptions = {
    from: {
      name: 'AptSync Support',
      address: process.env.SMTP_USER
    },
    to: toEmail,
    subject: 'Reset your AptSync password',
    html
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Password reset email sent to: ${toEmail}`);
}

// Send invitation email
async function sendInvitationEmail(toEmail, plainToken, userId, role) {
  const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/complete-registration?token=${plainToken}&id=${userId}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6d28d9;">You're Invited!</h2>
      <p>You've been invited to join <b>AptSync</b> as a ${role}.</p>
      <p>Click the button below to complete your registration. This link will expire in 24 hours.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${inviteUrl}" 
           style="background: #6d28d9; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          Complete Registration
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        Or copy and paste this link into your browser:<br>
        <code style="background: #f5f5f5; padding: 5px; border-radius: 3px;">${inviteUrl}</code>
      </p>
    </div>
  `;

  const mailOptions = {
    from: {
      name: 'AptSync Support',
      address: process.env.SMTP_USER
    },
    to: toEmail,
    subject: 'You are invited to join AptSync',
    html
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Invitation email sent to: ${toEmail}`);
}

module.exports = { 
  transporter, 
  sendVerificationEmail, 
  sendPasswordResetEmail,
  sendInvitationEmail,
  verifyTransport 
};

