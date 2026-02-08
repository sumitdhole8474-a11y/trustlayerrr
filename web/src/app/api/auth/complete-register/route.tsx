import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, otp, name, password } = await request.json();

    // Validate all fields
    if (!email || !otp || !name?.trim() || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email and OTP
    const user = await User.findOne({ 
      email: normalizedEmail,
      emailOtp: otp,
      emailOtpExpires: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Complete user registration
    user.name = name.trim();
    user.password = hashedPassword;
    user.emailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;
    
    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Account created successfully! You can now login.' 
    });

  } catch (error) {
    console.error('Complete registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}