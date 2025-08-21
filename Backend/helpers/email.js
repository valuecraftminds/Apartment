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

module.exports = { transporter, sendVerificationEmail, verifyTransport };
