import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import { sendOtpEmail } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Forgot password API called');
    
    // 1. Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { email } = body;

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`📧 Processing password reset for: ${normalizedEmail}`);

    // 2. Connect to database
    await connectDB();
    console.log('✅ Database connected');

    // 3. Find user
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      console.log(`⚠️ No user found with email: ${normalizedEmail}`);
      // Security: Don't reveal if user exists
      return NextResponse.json({ 
        success: true, 
        message: 'If an account exists with this email, you will receive a reset code.' 
      });
    }

    console.log(`👤 User found: ${user.email}`);

    // 4. Check cooldown (prevent spam)
    const now = new Date();
    if (user.lastOtpSentAt) {
      const timeSinceLastOtp = now.getTime() - user.lastOtpSentAt.getTime();
      const cooldownTime = 60000; // 60 seconds
      
      if (timeSinceLastOtp < cooldownTime) {
        const secondsLeft = Math.ceil((cooldownTime - timeSinceLastOtp) / 1000);
        console.log(`⏳ Cooldown active: ${secondsLeft} seconds remaining`);
        return NextResponse.json(
          { error: `Please wait ${secondsLeft} seconds before requesting a new code` },
          { status: 429 }
        );
      }
    }

    // 5. Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    console.log(`🔐 Generated OTP: ${otp}`);
    console.log(`⏰ OTP expires at: ${expiresAt}`);

    // 6. Update user
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = expiresAt;
    user.lastOtpSentAt = now;
    user.resetPasswordAllowed = true;
    
    console.log('💾 Saving user with reset OTP...');
    await user.save();
    console.log('✅ User saved successfully');

    // 7. Send OTP email
    console.log('📤 Attempting to send OTP email...');
    try {
      // Use the function with proper parameters
      const emailSent = await sendOtpEmail(normalizedEmail, otp);
      
      if (!emailSent) {
        console.warn('⚠️ Email sending failed, but OTP was generated');
        // Continue anyway - OTP is logged to console
      } else {
        console.log('✅ OTP email sent successfully');
      }
    } catch (emailError: any) {
      console.error('❌ Email sending error:', emailError.message);
      // Don't fail the request - OTP is already logged
    }

    // 8. Always log OTP in development for testing
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔓 [DEV] Password Reset OTP for ${normalizedEmail}: ${otp}`);
      console.log(`🔓 [DEV] Use this OTP: ${otp}`);
    }

    // 9. Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Password reset code sent to your email',
      email: normalizedEmail,
      // In development, include OTP for testing (remove in production)
      ...(process.env.NODE_ENV === 'development' && { devOtp: otp })
    });

  } catch (error: any) {
    console.error('❌ Forgot password error:', error);
    console.error('❌ Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Failed to process request. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}