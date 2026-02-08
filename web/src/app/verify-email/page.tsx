"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailFromQuery = searchParams.get("email") || "";

  const [email] = useState(emailFromQuery);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* 🔐 Redirect if email missing */
  useEffect(() => {
    if (!emailFromQuery) {
      router.replace("/register");
    }
  }, [emailFromQuery, router]);

  /* ✅ Verify OTP */
  async function handleVerifyOtp() {
    if (otp.length !== 6) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid verification code");
        setLoading(false);
        return;
      }

      setSuccess("Email verified successfully 🎉");

      setTimeout(() => {
        router.push(`/set-password?email=${encodeURIComponent(email)}`);
      }, 1200);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  /* 🔁 Resend OTP */
  async function handleResendOtp() {
    setError("");
    setSuccess("");
    setResendLoading(true);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setResendLoading(false);
        return;
      }

      setSuccess("New verification code sent 📩");
      setResendLoading(false);
    } catch {
      setError("Failed to resend code");
      setResendLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#020617] to-black px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">

        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-white">
            Verify your email
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <p className="mb-4 text-sm text-red-400 text-center">
            {error}
          </p>
        )}

        {/* SUCCESS */}
        {success && (
          <p className="mb-4 text-sm text-green-400 text-center">
            {success}
          </p>
        )}

        {/* EMAIL */}
        <div className="mb-4">
          <label className="text-sm text-gray-300 mb-1 block">
            Email
          </label>
          <input
            value={email}
            readOnly
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-gray-300 cursor-not-allowed"
          />
        </div>

        {/* OTP INPUT */}
        <div className="mb-6">
          <label className="text-sm text-gray-300 mb-1 block">
            Verification Code
          </label>
          <input
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, ""))
            }
            placeholder="123456"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* VERIFY BUTTON */}
        <button
          onClick={handleVerifyOtp}
          disabled={loading || otp.length !== 6}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition text-white font-bold disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        {/* RESEND */}
        <button
          onClick={handleResendOtp}
          disabled={resendLoading}
          className="mt-4 w-full text-sm text-indigo-400 hover:underline disabled:opacity-50"
        >
          {resendLoading ? "Resending..." : "Resend verification code"}
        </button>
      </div>
    </div>
  );
}
