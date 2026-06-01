"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Email wajib diisi"); return; }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Email tidak ditemukan");

      // Redirect langsung ke reset password dengan email sebagai query param
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f5f7] flex items-center justify-center py-12">
      <div className="w-full max-w-[440px] px-4 flex flex-col items-center">
        <div className="flex items-center gap-3.5 mb-8">
          <div className="w-[50px] h-[50px] flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="48" fill="#00a0e9" />
              <path d="M55 22 L32 54 H48 L41 78 L68 44 H52 L59 22 Z" fill="white" />
            </svg>
          </div>
          <h1 className="text-[25px] font-bold text-gray-900 leading-none font-sans select-none tracking-tight">
            PT Musla Trans Utama
          </h1>
        </div>

        <div className="w-full bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 overflow-hidden">
          <div className="bg-[#00a0e9] py-4.5 text-center">
            <h2 className="text-white text-[16px] font-semibold select-none">Lupa Password</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 flex flex-col">
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Masukkan email akun kamu untuk melanjutkan reset password.
            </p>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold text-center leading-relaxed">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-gray-800">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                disabled={loading}
                placeholder="email@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00a0e9] focus:ring-1 focus:ring-[#00a0e9] bg-white text-gray-900 text-sm transition-all"
              />
            </div>

            <div className="flex gap-4 mt-8">
              <a
                href="/auth/login"
                className="flex-1 py-3 px-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 text-gray-800 text-[13px] font-bold transition-all text-center"
              >
                Batal
              </a>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl bg-[#009b4c] hover:bg-[#008741] text-white text-[13px] font-bold transition-all shadow-sm disabled:opacity-50"
              >
                {loading ? "Memeriksa..." : "Lanjutkan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}