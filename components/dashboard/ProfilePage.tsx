"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import Breadcrumb from "@/components/dashboard/Breadcrumb";

type ProfilePageProps = {
  initialRole?: string;
  forcedRole?: string;
};

type MeResponse = {
  data?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
    location_id?: string | null;
  };
};

export default function ProfilePage({ initialRole, forcedRole }: ProfilePageProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resolvedRole, setResolvedRole] = useState(forcedRole || initialRole || "branch");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [lastPage, setLastPage] = useState({ label: "Timbangan", href: `/${resolvedRole}/timbangan` });

  React.useEffect(() => {
    const saved = sessionStorage.getItem("lastMainPage");
    if (saved) {
      setLastPage(JSON.parse(saved));
    }
  }, []);

  React.useEffect(() => {
    setLoading(true);
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          throw new Error("Gagal mengambil data profile");
        }

        const json = (await res.json()) as MeResponse;
        const user = json.data;

        if (!user) {
          throw new Error("Data profile tidak ditemukan");
        }

        if (!cancelled) {
          if (!forcedRole && user.role) {
            setResolvedRole(user.role);
          }

          setFormData((prev) => ({
            ...prev,
            name: user.name ?? "",
            email: user.email ?? "",
          }));
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [forcedRole]);

  const breadcrumbItems = useMemo(() => {
    if (resolvedRole === "finance" || resolvedRole === "manager") {
      return [
        { label: "Dashboard", href: `/${resolvedRole}/dashboard` },
        { label: "Profile" },
      ];
    }

    return [
      { label: lastPage.label, href: lastPage.href },
      { label: "Profile" },
    ];
  }, [lastPage, resolvedRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Nama dan email wajib diisi");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Gagal menyimpan profile");
      }

      setSuccess("Profile berhasil diperbarui");
      setFormData((prev) => ({ ...prev, password: "" }));

      setTimeout(() => {
        if (resolvedRole === "finance" || resolvedRole === "manager") {
          router.push(`/${resolvedRole}/dashboard?success=true`);
          return;
        }

        router.push(`/${resolvedRole}/timbangan?success=true`);
      }, 900);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Profile</h1>
      </div>

      <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden transition-all w-full">
        <div className="px-8 py-5 border-b border-gray-100 bg-white">
          <h2 className="text-base font-bold text-gray-900">Profile</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col md:flex-row items-start gap-12 max-w-4xl w-full">
          <div className="flex-1 w-full flex flex-col gap-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold leading-relaxed">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3.5 rounded-xl bg-green-50 border border-green-100 text-green-700 text-xs font-semibold leading-relaxed">
                {success}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-950 block">Nama</label>
              <input
                type="text"
                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-green-600 transition-all font-medium text-sm text-gray-800 shadow-sm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading || saving}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-950 block">Email</label>
              <input
                type="email"
                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-green-600 transition-all font-medium text-sm text-gray-800 shadow-sm"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading || saving}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-950 block">Password Baru (Opsional)</label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-5 py-3.5 pr-12 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-green-600 transition-all font-medium text-sm text-gray-800 shadow-sm"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                  disabled={loading || saving}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  {showPassword ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                type="button"
                className="w-full py-3.5 bg-white border border-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-50 active:scale-[0.98] transition-all text-sm cursor-pointer text-center"
                onClick={() => router.back()}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full py-3.5 bg-[#009253] text-white rounded-xl font-bold hover:bg-[#007d47] active:scale-[0.98] transition-all text-sm cursor-pointer text-center disabled:opacity-60"
                disabled={loading || saving}
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
