"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCredentialsLogin() {
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#020617] to-black px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white">
            Welcome Back 👋
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Login to continue to your dashboard
          </p>
        </div>

        {/* GOOGLE LOGIN */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition"
        >
          <Image
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            width={20}
            height={20}
          />
          Continue with Google
        </button>

        {/* DIVIDER */}
        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-xs text-gray-400 uppercase tracking-widest">
            or
          </span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        {/* ERROR */}
        {error && (
          <p className="mb-4 text-sm text-red-400 text-center">
            {error}
          </p>
        )}

        {/* EMAIL */}
        <div className="mb-4">
          <label className="text-sm text-gray-300 mb-1 block">
            Email address
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="mb-6">
          <label className="text-sm text-gray-300 mb-1 block">
            Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* LOGIN BUTTON */}
        <button
          onClick={handleCredentialsLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition text-white font-bold disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* FOOTER */}
        <div className="flex justify-between items-center mt-6 text-sm">
          <Link href="/forgot-password" className="text-indigo-400 hover:underline">
            Forgot password?
          </Link>
          <Link href="/register" className="text-gray-400 hover:text-white">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
