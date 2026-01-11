// helpers/email.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter with better error handling
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    // Add connection timeout
    connectionTimeout: 10000,
    // Add greeting timeout
    greetingTimeout: 10000,
    // Add socket timeout
    socketTimeout: 10000
  });
};

let transporter = createTransporter();

// Verify transport on startup
async function verifyTransport() {
  try {
    await transporter.verify();
    console.log('✅ SMTP transporter verified successfully');
    return true;
  } catch (error) {
    console.error('❌ SMTP verification failed:', error.message);
    
    // Try to recreate transporter with different configuration
    try {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 587, // Try standard port
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      await transporter.verify();
      console.log('✅ SMTP transporter recreated and verified');
      return true;
    } catch (retryError) {
      console.error('❌ SMTP retry also failed:', retryError.message);
      return false;
    }
  }
}

async function sendVerificationEmail(toEmail, plainToken, userId) {
  try {
    console.log(`📧 Attempting to send verification email to: ${toEmail}`);
    
    // Verify the transporter first
    const isVerified = await verifyTransport();
    if (!isVerified) {
      throw new Error('SMTP transporter not verified');
    }

    // FIXED: Use the correct verification endpoint
    const verificationUrl = `${process.env.FRONTEND_URL || 'https://apmt.apivcm.shop'}/verify?token=${plainToken}&id=${userId}`;
    
    console.log(`🔗 Verification URL: ${verificationUrl}`);
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #6d28d9; margin: 0;">Welcome to AptSync! 🎉</h2>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">
            Thank you for registering with AptSync. To complete your registration and verify your email address, please click the button below:
          </p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${verificationUrl}" 
               style="background: #6d28d9; color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;
                      font-size: 16px; font-weight: 600; border: none; cursor: pointer;">
              Verify Email Address
            </a>
          </div>
          
          <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px; text-align: center;">
            This verification link will expire in 24 hours.
          </p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
          <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="margin: 0; background: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #374151;">
            ${verificationUrl}
          </p>
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
            If you didn't create an account with AptSync, please ignore this email.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: {
        name: 'AptSync',
        address: process.env.SMTP_USER || process.env.EMAIL_FROM || 'noreply@aptsync.com'
      },
      to: toEmail,
      subject: 'Verify Your Email Address - AptSync',
      html: html,
      // Add text version for email clients that don't support HTML
      text: `Welcome to AptSync!\n\nPlease verify your email address by clicking the following link:\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.`
    };

    console.log('📤 Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    // Send email with timeout
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email sending timeout')), 15000)
    );

    const result = await Promise.race([sendPromise, timeoutPromise]);
    
    console.log(`✅ Verification email sent successfully to: ${toEmail}`);
    console.log('📨 Message ID:', result.messageId);
    
    return true;

  } catch (error) {
    console.error(`❌ Failed to send verification email to ${toEmail}:`, error.message);
    
    // More detailed error logging
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.response) {
      console.error('SMTP response:', error.response);
    }
    
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}

// Send password reset email
async function sendPasswordResetEmail(toEmail, resetToken, userId, userType = 'user') {
  try {
    console.log(`📧 Attempting to send password reset email to: ${toEmail}`);
    
    const isVerified = await verifyTransport();
    if (!isVerified) {
      throw new Error('SMTP transporter not verified');
    }

    // FIXED: Use consistent parameter name 'user_type'
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&id=${userId}&user_type=${userType}`;
    
    console.log(`🔗 Reset URL generated: ${resetUrl}`);
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #dc2626; margin: 0;">Password Reset Request</h2>
        </div>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">
            You requested to reset your password for your AptSync account.
          </p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" 
               style="background: #dc2626; color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;
                      font-size: 16px; font-weight: 600; border: none; cursor: pointer;">
              Reset Password
            </a>
          </div>
          
          <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px; text-align: center;">
            This reset link will expire in 15 minutes.
          </p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
          <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="margin: 0; background: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #374151;">
            ${resetUrl}
          </p>
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
            If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: {
        name: 'AptSync Support',
        address: process.env.SMTP_USER || process.env.EMAIL_FROM || 'support@aptsync.com'
      },
      to: toEmail,
      subject: 'Reset Your AptSync Password',
      html: html,
      text: `You requested to reset your password for AptSync.\n\nClick the following link to reset your password:\n${resetUrl}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request this, please ignore this email.`
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent successfully to: ${toEmail}`);
    return result;
    
  } catch (error) {
    console.error(`❌ Failed to send password reset email to ${toEmail}:`, error.message);
    throw error;
  }
}

// Send invitation email
async function sendInvitationEmail(toEmail, plainToken, userId, role) {
  try {
    console.log(`📧 Attempting to send invitation email to: ${toEmail}`);
    
    const isVerified = await verifyTransport();
    if (!isVerified) {
      throw new Error('SMTP transporter not verified');
    }

    const inviteUrl = `${process.env.FRONTEND_URL || 'https://apmt.apivcm.shop'}/complete-registration?token=${plainToken}&id=${userId}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #7c3aed; margin: 0;">You're Invited! 🎉</h2>
        </div>
        
        <div style="background-color: #faf5ff; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">
            You've been invited to join <strong>AptSync</strong> as a <strong>${role}</strong>.
          </p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${inviteUrl}" 
               style="background: #7c3aed; color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;
                      font-size: 16px; font-weight: 600; border: none; cursor: pointer;">
              Complete Registration
            </a>
          </div>
          
          <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px; text-align: center;">
            This invitation link will expire in 24 hours.
          </p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
          <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="margin: 0; background: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #374151;">
            ${inviteUrl}
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: {
        name: 'AptSync Support',
        address: process.env.SMTP_USER || process.env.EMAIL_FROM || 'invitations@aptsync.com'
      },
      to: toEmail,
      subject: `You're Invited to Join AptSync as ${role}`,
      html: html,
      text: `You've been invited to join AptSync as ${role}.\n\nClick the following link to complete your registration:\n${inviteUrl}\n\nThis invitation will expire in 24 hours.`
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Invitation email sent successfully to: ${toEmail}`);
    return result;
    
  } catch (error) {
    console.error(`❌ Failed to send invitation email to ${toEmail}:`, error.message);
    throw error;
  }
}

// HOuse owner verification email
async function sendHouseOwnerVerificationEmail(toEmail, plainToken, ownerId) {
  try {
    console.log(`📧 Attempting to send house owner verification email to: ${toEmail}`);
    
    const isVerified = await verifyTransport();
    if (!isVerified) {
      throw new Error('SMTP transporter not verified');
    }

    const verificationUrl = `${process.env.FRONTEND_URL || 'https://apmt.apivcm.shop'}/houseowner/verify?token=${plainToken}&id=${ownerId}`;
    
    console.log(`🔗 House Owner Verification URL: ${verificationUrl}`);
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #6d28d9; margin: 0;">Welcome to AptSync House Owner Portal! 🏠</h2>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">
            An account has been created for you as a house owner in AptSync. To verify your email address and set up your account, please click the button below:
          </p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${verificationUrl}" 
               style="background: #6d28d9; color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;
                      font-size: 16px; font-weight: 600; border: none; cursor: pointer;">
              Verify Email & Setup Account
            </a>
          </div>
          
          <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px; text-align: center;">
            This verification link will expire in 24 hours.
          </p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
          <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="margin: 0; background: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #374151;">
            ${verificationUrl}
          </p>
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
            If you didn't expect this invitation, please ignore this email.
          </p>
          <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
            After verification, you can login to the house owner portal at: ${process.env.FRONTEND_URL || 'https://apmt.apivcm.shop'}/houseowner/login
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: {
        name: 'AptSync House Owner Portal',
        address: process.env.SMTP_USER || process.env.EMAIL_FROM || 'houseowner@aptsync.com'
      },
      to: toEmail,
      subject: 'Verify Your House Owner Account - AptSync',
      html: html,
      text: `Welcome to AptSync House Owner Portal!\n\nAn account has been created for you. Please verify your email address by clicking the following link:\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nAfter verification, you can login at: ${process.env.FRONTEND_URL || 'https://apmt.apivcm.shop'}/houseowner/login\n\nIf you didn't expect this invitation, please ignore this email.`
    };

    console.log('📤 Sending house owner verification email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email sending timeout')), 15000)
    );

    const result = await Promise.race([sendPromise, timeoutPromise]);
    
    console.log(`✅ House owner verification email sent successfully to: ${toEmail}`);
    console.log('📨 Message ID:', result.messageId);
    
    return true;

  } catch (error) {
    console.error(`❌ Failed to send house owner verification email to ${toEmail}:`, error.message);
    throw new Error(`Failed to send house owner verification email: ${error.message}`);
  }
}

// Send password reset email
async function sendHouseOwnerPasswordResetEmail(toEmail, resetToken, ownerId) {
  try {
    console.log(`📧 Attempting to send password reset email to: ${toEmail}`);
    
    const isVerified = await verifyTransport();
    if (!isVerified) {
      throw new Error('SMTP transporter not verified');
    }

    const resetUrl = `${process.env.FRONTEND_URL || 'https://apmt.apivcm.shop'}/reset-password?token=${resetToken}&id=${ownerId}&type=houseowner`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #dc2626; margin: 0;">Password Reset Request</h2>
        </div>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">
            You requested to reset your password for your AptSync account.
          </p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" 
               style="background: #dc2626; color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;
                      font-size: 16px; font-weight: 600; border: none; cursor: pointer;">
              Reset Password
            </a>
          </div>
          
          <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px; text-align: center;">
            This reset link will expire in 15 minutes.
          </p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
          <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="margin: 0; background: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #374151;">
            ${resetUrl}
          </p>
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
            If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: {
        name: 'AptSync Support',
        address: process.env.SMTP_USER || process.env.EMAIL_FROM || 'support@aptsync.com'
      },
      to: toEmail,
      subject: 'Reset Your AptSync Password',
      html: html,
      text: `You requested to reset your password for AptSync.\n\nClick the following link to reset your password:\n${resetUrl}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request this, please ignore this email.`
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent successfully to: ${toEmail}`);
    return result;
    
  } catch (error) {
    console.error(`❌ Failed to send password reset email to ${toEmail}:`, error.message);
    throw error;
  }
}

// Call verifyTransport on module load
verifyTransport().then(success => {
  if (success) {
    console.log('🚀 Email module initialized successfully');
  } else {
    console.log('⚠️ Email module initialized with warnings');
  }
});


module.exports = { 
  transporter, 
  sendVerificationEmail, 
  sendPasswordResetEmail,
  sendInvitationEmail,
  sendHouseOwnerVerificationEmail,
  sendHouseOwnerPasswordResetEmail,
  verifyTransport 
};
