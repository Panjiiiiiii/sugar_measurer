"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeSlash, CheckCircle } from "@phosphor-icons/react";

interface PasswordRule {
  label: string;
  test: (v: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: "Minimal 8 karakter",                  test: (v) => v.length >= 8 },
  { label: "Mengandung angka",                    test: (v) => /[0-9]/.test(v) },
  { label: "Mengandung huruf kapital",            test: (v) => /[A-Z]/.test(v) },
  { label: "Mengandung karakter unik (!@#$%^&*)", test: (v) => /[^a-zA-Z0-9]/.test(v) },
];

export default function ResetPasswordPage() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const email         = searchParams.get("email") ?? "";

  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [success,         setSuccess]         = useState(false);

  // Kalau tidak ada email di query param, redirect ke forgot
  useEffect(() => {
    if (!email) router.replace("/auth/forgot-password");
  }, [email, router]);

  const allRulesPassed  = PASSWORD_RULES.every((r) => r.test(newPassword));
  const passwordsMatch  = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRulesPassed) { setError("Password belum memenuhi semua syarat"); return; }
    if (!passwordsMatch) { setError("Konfirmasi password tidak cocok"); return; }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, new_password: newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal reset password");

      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

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
            <h2 className="text-white text-[16px] font-semibold select-none">Reset Password</h2>
          </div>

          <div className="p-8">
            {success ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <CheckCircle size={52} weight="duotone" className="text-[#009b4c]" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Password berhasil direset!</p>
                  <p className="text-xs text-gray-400 mt-1">Mengalihkan ke halaman login...</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <p className="text-xs text-gray-400 -mt-1 leading-relaxed">
                  Reset password untuk akun <span className="font-bold text-gray-600">{email}</span>
                </p>

                {error && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold text-center leading-relaxed">
                    {error}
                  </div>
                )}

                {/* New Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-semibold text-gray-800">Password Baru</label>
                  <div className="relative flex items-center">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                      disabled={loading}
                      className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#00a0e9] focus:ring-1 focus:ring-[#00a0e9] bg-white text-gray-900 text-sm transition-all"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} tabIndex={-1}
                      className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors">
                      {showNew ? <EyeSlash size={19} weight="bold" /> : <Eye size={19} weight="bold" />}
                    </button>
                  </div>

                  {/* Password rules */}
                  <div className="flex flex-col gap-1.5 mt-1 pl-1">
                    {PASSWORD_RULES.map((rule) => {
                      const passed = rule.test(newPassword);
                      return (
                        <span key={rule.label}
                          className={`flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
                            newPassword.length === 0 ? "text-gray-400" : passed ? "text-[#009b4c]" : "text-red-500"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            newPassword.length === 0 ? "bg-gray-300" : passed ? "bg-[#009b4c]" : "bg-red-400"
                          }`} />
                          {rule.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-semibold text-gray-800">Konfirmasi Password</label>
                  <div className="relative flex items-center">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                      disabled={loading}
                      className={`w-full pl-4 pr-12 py-3 rounded-xl border focus:outline-none focus:ring-1 bg-white text-gray-900 text-sm transition-all ${
                        confirmPassword.length > 0 && !passwordsMatch
                          ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                          : "border-gray-200 focus:border-[#00a0e9] focus:ring-[#00a0e9]"
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}
                      className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors">
                      {showConfirm ? <EyeSlash size={19} weight="bold" /> : <Eye size={19} weight="bold" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <span className="text-[11px] font-semibold text-red-500 pl-1">Password tidak cocok</span>
                  )}
                  {passwordsMatch && (
                    <span className="text-[11px] font-semibold text-[#009b4c] pl-1">Password cocok ✓</span>
                  )}
                </div>

                <div className="flex gap-4 mt-2">
                  <a href="/auth/login"
                    className="flex-1 py-3 px-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 text-gray-800 text-[13px] font-bold transition-all text-center">
                    Batal
                  </a>
                  <button type="submit"
                    disabled={loading || !allRulesPassed || !passwordsMatch}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#009b4c] hover:bg-[#008741] text-white text-[13px] font-bold transition-all shadow-sm disabled:opacity-50">
                    {loading ? "Menyimpan..." : "Reset Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}