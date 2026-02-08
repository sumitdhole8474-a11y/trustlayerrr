import bcrypt from "bcryptjs";

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function hashOtp(otp: string) {
  return bcrypt.hash(otp, 10);
}

export function otpExpiry() {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
}
