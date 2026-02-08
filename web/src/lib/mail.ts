// web/src/lib/mail.ts
import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Main function - simplified to accept only email and OTP
export async function sendOtpEmail(
  to: string, 
  otp: string
): Promise<boolean> {
  try {
    // Always log OTP in development
    console.log(`📧 [DEV] OTP for ${to}: ${otp}`);
    
    // Only send actual email in production or if SMTP is configured
    const shouldSendEmail = process.env.NODE_ENV === 'production' || 
                           (process.env.SMTP_USER && process.env.SMTP_PASS);
    
    if (shouldSendEmail) {
      const subject = 'Your TrustLayer Password Reset Code';
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4f46e5;">Reset Your Password</h2>
          <p>Your password reset code for TrustLayer is:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="font-size: 36px; letter-spacing: 8px; color: #111827; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="color: #6b7280; font-size: 12px;">TrustLayer Secure Business Platform</p>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"TrustLayer" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      
      console.log(`✅ Email sent to ${to}`);
    } else {
      console.log(`⚠️ Email not sent (development mode). OTP: ${otp}`);
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ Email error:', error.message);
    return false;
  }
}

// Optional: Separate function for verification emails
export async function sendVerificationEmail(to: string, otp: string): Promise<boolean> {
  // Same logic but with different subject/template
  const subject = 'Verify Your TrustLayer Account';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4f46e5;">Verify Your Email</h2>
      <p>Your verification code for TrustLayer is:</p>
      <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
        <h1 style="font-size: 36px; letter-spacing: 8px; color: #111827; margin: 0;">${otp}</h1>
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
      <p style="color: #6b7280; font-size: 12px;">TrustLayer Secure Business Platform</p>
    </div>
  `;
  
  return sendEmailWithTemplate(to, subject, html, otp);
}

// Helper function
async function sendEmailWithTemplate(to: string, subject: string, html: string, otp: string): Promise<boolean> {
  try {
    console.log(`📧 [DEV] ${subject} OTP for ${to}: ${otp}`);
    
    if (process.env.NODE_ENV === 'production' || (process.env.SMTP_USER && process.env.SMTP_PASS)) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"TrustLayer" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
    }
    
    return true;
  } catch (error: any) {
    console.error('Email error:', error.message);
    return false;
  }
}