import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { generateOtp, hashOtp, otpExpiry } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    await connectDB();

    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        email: email.toLowerCase(),
        emailOtp: hashedOtp,
        emailOtpExpires: otpExpiry(),
      },
      { upsert: true, new: true }
    );

    await sendOtpEmail(email, otp);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
