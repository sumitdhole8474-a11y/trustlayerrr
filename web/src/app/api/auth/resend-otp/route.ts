import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import { sendOtpEmail } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check cooldown (prevent spam)
    const now = new Date();
    if (user.lastOtpSentAt && (now.getTime() - user.lastOtpSentAt.getTime()) < 60000) {
      return NextResponse.json(
        { error: 'Please wait 60 seconds before requesting a new code' },
        { status: 429 }
      );
    }

    // Generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    // Update user
    user.emailOtp = otp;
    user.emailOtpExpires = expiresAt;
    user.lastOtpSentAt = now;
    await user.save();

    // Send email
    await sendOtpEmail(email, otp);

    return NextResponse.json({ 
      success: true, 
      message: 'New verification code sent' 
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification code' },
      { status: 500 }
    );
  }
}