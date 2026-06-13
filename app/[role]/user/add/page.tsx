"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CaretDown, Eye, EyeSlash } from "@phosphor-icons/react";
import { Toast } from "@/components/ui";
import Link from "next/link";
import axios from "@/lib/axios";

interface Location {
  id: string;
  name: string;
}

export default function AddUserPage() {
  const router = useRouter();
  const params = useParams();
  const roleRaw = params.role as string;
  const role = !roleRaw || roleRaw === "undefined" ? "manager" : roleRaw;

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");

  // Locations State
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  // UI States
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get("/api/location?limit=100");
        setLocations(response.data?.data ?? []);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setToastType("error");
        setToastMessage("Gagal memuat data lokasi");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !selectedRole || !selectedLocationId) {
      setToastType("error");
      setToastMessage("Harap lengkapi semua bidang bertanda *");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    try {
      setIsSaving(true);

      await axios.post("/api/user", {
        name: name.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
        location_id: selectedLocationId,
      });

      sessionStorage.setItem(
        "user-toast-message",
        "User berhasil ditambahkan"
      );
      router.push(`/${role}/user?success=true`);
    } catch (error) {
      setIsSaving(false);
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Gagal menyimpan data user";
        setToastType("error");
        setToastMessage(message);
      } else {
        setToastType("error");
        setToastMessage("Terjadi kesalahan, coba lagi");
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="space-y-8">
      <Toast
        isVisible={showToast}
        message={toastMessage}
        type={toastType}
      />

      {/* Header section with Breadcrumbs */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Input User</h1>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 select-none">
          <Link href={`/${role}/user`} className="hover:text-gray-900 transition-colors">
            Data User
          </Link>
          <span>&gt;</span>
          <span className="text-gray-900">Input User</span>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white border border-[#F3F4F6] rounded-3xl shadow-sm overflow-hidden w-full max-w-5xl mx-auto">
        {/* Card Header */}
        <div className="px-8 py-5 border-b border-[#F3F4F6]">
          <h2 className="text-base font-bold text-gray-900 select-none">Form Input User</h2>
        </div>

        {/* Card Form */}
        <form onSubmit={handleSave} className="p-8 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-800 ml-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=""
              disabled={isSaving}
              className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#009B4C]/10 focus:border-[#009B4C] transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-800 ml-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=""
              disabled={isSaving}
              className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#009B4C]/10 focus:border-[#009B4C] transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-800 ml-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                disabled={isSaving}
                className="w-full px-5 py-3.5 pr-14 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#009B4C]/10 focus:border-[#009B4C] transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                disabled={isSaving}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {showPassword ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 ml-1">
              Min. 8 karakter, mengandung huruf besar, huruf kecil, dan angka
            </p>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-800 ml-1">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="relative w-full">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={isSaving}
                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#009B4C]/10 focus:border-[#009B4C] transition-all text-sm font-semibold text-gray-900 appearance-none cursor-pointer pr-12"
              >
                <option value="" disabled hidden></option>
                <option value="operator">Admin Cabang</option>
                <option value="finance">Admin Finance</option>
                <option value="manager">Manager</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <CaretDown size={16} weight="bold" />
              </div>
            </div>
          </div>

          {/* Lokasi */}
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-800 ml-1">
              Lokasi <span className="text-red-500">*</span>
            </label>
            <div className="relative w-full">
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                disabled={isSaving || isLoadingLocations}
                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#009B4C]/10 focus:border-[#009B4C] transition-all text-sm font-semibold text-gray-900 appearance-none cursor-pointer pr-12 disabled:opacity-60"
              >
                <option value="" disabled hidden>
                  {isLoadingLocations ? "Memuat lokasi..." : ""}
                </option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <CaretDown size={16} weight="bold" />
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 max-w-5xl mx-auto w-full">
        <button
          type="button"
          onClick={() => router.push(`/${role}/user`)}
          disabled={isSaving}
          className="flex-1 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 hover:bg-gray-50 active:scale-[0.98] transition-all shadow-sm cursor-pointer text-center"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isLoadingLocations}
          className="flex-1 py-4 bg-[#009B4C] hover:bg-[#008741] text-white rounded-2xl text-sm font-bold active:scale-[0.98] transition-all shadow-md cursor-pointer text-center disabled:opacity-60"
        >
          {isSaving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </div>
  );
}