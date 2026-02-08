"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Complete
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Step 1: Send OTP to email
  async function handleSendOtp() {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification code");
      }

      setStep(2);
      setSuccess("Verification code sent to your email!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify OTP
  async function handleVerifyOtp() {
    if (otp.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Just verify OTP and move to next step
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code");
      }

      setStep(3);
      setSuccess("Email verified! Now complete your account.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Step 3: Complete registration
  async function handleCompleteRegistration() {
    if (!name.trim() || !password) {
      setError("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/complete-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      setSuccess("Account created successfully! Redirecting to login...");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
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
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 mt-2">
            {step === 1 && "Start by verifying your email"}
            {step === 2 && "Verify your email address"}
            {step === 3 && "Complete your profile"}
          </p>
          
          {/* Step indicator */}
          <div className="flex justify-center mt-4 space-x-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s <= step
                    ? "w-8 bg-blue-500"
                    : "w-2 bg-gray-700"
                }`}
              />
            ))}
          </div>
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

        {/* Step 1: Email */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </motion.div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <p className="text-sm text-gray-300 mb-4">
                We sent a 6-digit code to <span className="font-semibold text-white">{email}</span>
              </p>
              
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-3 text-center text-2xl tracking-widest bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123456"
                required
              />
              
              <p className="text-xs text-gray-400 mt-2">
                Check your inbox (and spam folder) for the code
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep(1);
                  setOtp("");
                }}
                className="flex-1 py-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl text-white transition-colors"
              >
                Back
              </button>
              
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50"
            >
              Resend verification code
            </button>
          </motion.div>
        )}

        {/* Step 3: Complete Profile */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                minLength={6}
                required
              />
              <p className="text-xs text-gray-400 mt-2">Minimum 6 characters</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl text-white transition-colors"
              >
                Back
              </button>
              
              <button
                onClick={handleCompleteRegistration}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-50 shadow-lg shadow-green-500/20"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </motion.div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}