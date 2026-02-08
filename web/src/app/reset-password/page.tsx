"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const emailFromQuery = searchParams.get("email") || "";
  const [email] = useState(emailFromQuery);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Verify OTP, 2: Set new password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* 🔐 Redirect if email missing */
  useEffect(() => {
    if (!emailFromQuery) {
      router.replace("/forgot-password");
    }
  }, [emailFromQuery, router]);

  /* ✅ Verify OTP */
  async function handleVerifyOtp() {
    if (otp.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid reset code");
        setLoading(false);
        return;
      }

      setSuccess("Reset code verified! Now set your new password.");
      setStep(2);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  /* 🔁 Reset Password */
  async function handleResetPassword() {
    if (!newPassword || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (otp.length !== 6) {
      setError("Invalid reset code");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          otp: otp.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password");
        setLoading(false);
        return;
      }

      setSuccess("Password reset successfully! Redirecting to login...");
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setError("Failed to reset password. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            {step === 1 ? "Verify Reset Code" : "Set New Password"}
          </h1>
          <p className="text-gray-400 mt-2">
            {step === 1 
              ? "Enter the 6-digit code sent to your email" 
              : "Create a new password for your account"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-center text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
            <p className="text-green-400 text-center text-sm">{success}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Email display */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              value={email}
              readOnly
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-gray-300 cursor-not-allowed"
            />
          </div>

          {/* Step 1: OTP Verification */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reset Code
                </label>
                <input
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Check your email (and spam folder) for the 6-digit code
                </p>
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>

              <div className="text-center">
                <button
                  onClick={() => router.push(`/forgot-password?email=${encodeURIComponent(email)}`)}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Request new code
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Set New Password */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl text-white transition-colors"
                >
                  Back
                </button>
                
                <button
                  onClick={handleResetPassword}
                  disabled={loading || !newPassword || !confirmPassword}
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-50 shadow-lg shadow-green-500/20"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </motion.div>
          )}

          <div className="text-center pt-4 border-t border-gray-700/50">
            <Link
              href="/login"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}