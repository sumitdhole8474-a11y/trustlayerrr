import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendOtpEmail } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email } = await request.json();

    // Only email is required initially
    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create a temporary user record (without password)
    const user = new User({
      email: normalizedEmail,
      emailOtp: otp,
      emailOtpExpires: expiresAt,
      lastOtpSentAt: new Date(),
      emailVerified: false,
      // Don't set name or password yet
    });

    await user.save();

    // Send OTP email
    try {
      await sendOtpEmail(normalizedEmail, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // In development, log the OTP
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] OTP for ${normalizedEmail}: ${otp}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent to your email',
      email: normalizedEmail 
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code. Please try again.' },
      { status: 500 }
    );
  }
}