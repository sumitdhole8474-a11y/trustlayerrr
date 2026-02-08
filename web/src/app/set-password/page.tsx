"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSetPassword() {
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#020617] to-black px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">

        <h1 className="text-3xl font-extrabold text-white text-center mb-6">
          Complete your account
        </h1>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4">
            {error}
          </p>
        )}

        {/* Name */}
        <input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Email (readonly) */}
        <input
          value={email}
          readOnly
          className="w-full mb-4 px-4 py-3 rounded-xl bg-white/5 text-gray-400 cursor-not-allowed"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Create password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={handleSetPassword}
          disabled={loading || !password}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition text-white font-bold disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </div>
    </div>
  );
}
