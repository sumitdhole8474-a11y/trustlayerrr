import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user with email first
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid reset code' },
        { status: 400 }
      );
    }

    // Check if OTP exists
    if (!user.resetPasswordOtp) {
      return NextResponse.json(
        { error: 'No reset code found. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if OTP matches
    if (user.resetPasswordOtp !== otp.trim()) {
      return NextResponse.json(
        { error: 'Invalid reset code' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    const now = new Date();
    if (!user.resetPasswordOtpExpires || user.resetPasswordOtpExpires < now) {
      return NextResponse.json(
        { error: 'Reset code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if reset is allowed
    if (!user.resetPasswordAllowed) {
      return NextResponse.json(
        { error: 'Password reset is not allowed for this account.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Reset code verified successfully'
    });

  } catch (error) {
    console.error('Reset OTP verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify reset code' },
      { status: 500 }
    );
  }
}