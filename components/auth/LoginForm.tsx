"use client";

import React, { useState } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";

interface LoginFormProps {
  initialRole?: string;
}

export default function LoginForm({ initialRole }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Username dan password wajib diisi");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // credentials: include agar cookie di-set oleh browser
        credentials: "include",
        body: JSON.stringify({ email: username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Username atau password salah");
      }

      // Token ada di httpOnly cookie — tinggal redirect berdasarkan role dari response body
      const role = data.data?.role;
      if (!role) throw new Error("Role tidak ditemukan");

      if (role === "finance") {
        window.location.href = "/finance/dashboard";
      } else if (role === "manager") {
        window.location.href = "/manager/dashboard";
      } else if (role === "master") {
        window.location.href = "/master";
      } else {
        window.location.href = "/operator";
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat masuk");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setUsername("");
    setPassword("");
    setError(null);
  };

  return (
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
          <h2 className="text-white text-[16px] font-semibold select-none">Login</h2>
        </div>

        <form onSubmit={handleLogin} className="p-8 flex flex-col">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold text-center leading-relaxed">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-gray-800 text-left">email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00a0e9] focus:ring-1 focus:ring-[#00a0e9] bg-white text-gray-900 text-sm transition-all"
            />
          </div>

          <div className="flex flex-col gap-2 mt-5">
            <label className="text-[13px] font-semibold text-gray-800 text-left">Password</label>
            <div className="relative w-full flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00a0e9] focus:ring-1 focus:ring-[#00a0e9] bg-white text-gray-900 text-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-4 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeSlash size={19} weight="bold" /> : <Eye size={19} weight="bold" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end mt-2">
              <a
                href="/auth/forgot-password"
                className="text-[12px] font-semibold text-[#00a0e9] hover:underline"
              >
                Lupa password?
              </a>
            </div>

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 text-gray-800 text-[13px] font-bold transition-all focus:outline-none focus:ring-1 focus:ring-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-[#009b4c] hover:bg-[#008741] text-white text-[13px] font-bold transition-all shadow-sm focus:outline-none focus:ring-1 focus:ring-[#009b4c] disabled:opacity-50"
            >
              {loading ? "Loading..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}