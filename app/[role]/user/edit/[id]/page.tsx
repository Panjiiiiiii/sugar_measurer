"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CaretDown } from "@phosphor-icons/react";
import { Toast } from "@/components/ui";
import Link from "next/link";
import axios from "axios";

interface UserItem {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "operator" | "finance" | "master" | "manager";
  location?: {
    id: string;
    name: string;
  };
}

const fallbackMockUsers: Record<string, UserItem> = {
  "mock-1": {
    id: "mock-1",
    name: "Budi",
    email: "email@email.com",
    password: "adfhaipfh123!!ss",
    role: "operator",
    location: { id: "loc-2", name: "Blitar" }
  },
  "mock-2": {
    id: "mock-2",
    name: "Dadang",
    email: "email@email.com",
    password: "adsldfRFS123!",
    role: "finance",
    location: { id: "loc-1", name: "Malang" }
  },
  "mock-3": {
    id: "mock-3",
    name: "Julpan",
    email: "email@email.com",
    password: "adsldfRFS123!",
    role: "finance",
    location: { id: "loc-3", name: "Kediri" }
  },
  "mock-4": {
    id: "mock-4",
    name: "Jaedin",
    email: "email@email.com",
    password: "adsldfRFS123!",
    role: "finance",
    location: { id: "loc-2", name: "Blitar" }
  }
};

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const roleRaw = params.role as string;
  const role = !roleRaw || roleRaw === "undefined" ? "manager" : roleRaw;
  const userId = params.id as string;

  // Form States
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  // UI States
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      setIsLoading(true);
      try {
        // Attempt database fetch first
        const response = await axios.get(`/api/user/${userId}`);
        if (!isMounted) return;

        const apiUser = response.data?.data;
        if (apiUser) {
          setUsername(apiUser.name ?? "");
          setEmail(apiUser.email ?? "");
          setPassword(apiUser.password ?? "adsldfRFS123!");
          setSelectedRole(apiUser.role ?? "");
          setSelectedLocation(apiUser.location?.name ?? "Malang");
        } else {
          loadFallback();
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn("Failed to fetch user from DB, falling back to mock data:", err);
        loadFallback();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    function loadFallback() {
      // Fallback matching Image 2 exactly when id is mock-1 or defaulted
      const fallbackUser = fallbackMockUsers[userId] || fallbackMockUsers["mock-1"];
      setUsername(fallbackUser.name);
      setEmail(fallbackUser.email);
      setPassword(fallbackUser.password || "adfhaipfh123!!ss");
      setSelectedRole(fallbackUser.role);
      setSelectedLocation(fallbackUser.location?.name || "Blitar");
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !email || !password || !selectedRole || !selectedLocation) {
      setToastType("error");
      setToastMessage("Harap lengkapi semua bidang bertanda *");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setIsSaving(true);
    setToastType("success");
    setToastMessage("Data Berhasil Disimpan");
    setShowToast(true);

    setTimeout(() => {
      router.push(`/${role}/user`);
    }, 1500);
  };

  return (
    <div className="p-8 space-y-8 bg-[#F9FAFB] min-h-[calc(100vh-72px)]">
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
          <span className="text-gray-900">Edit User</span>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white border border-[#F3F4F6] rounded-3xl shadow-sm overflow-hidden w-full max-w-5xl mx-auto">
        {/* Card Header */}
        <div className="px-8 py-5 border-b border-[#F3F4F6]">
          <h2 className="text-base font-bold text-gray-900 select-none">Form Input User</h2>
        </div>

        {/* Card Form */}
        {isLoading ? (
          <div className="p-20 text-center text-sm font-semibold text-gray-400 select-none animate-pulse">
            Memuat formulir edit user...
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-8 space-y-6 animate-in fade-in duration-200">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-800 ml-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                disabled={isSaving}
                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#009B4C]/10 focus:border-[#009B4C] transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-800 ml-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSaving}
                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#009B4C]/10 focus:border-[#009B4C] transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400"
              />
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
                  <option value="master">Super Admin</option>
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
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  disabled={isSaving}
                  className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#009B4C]/10 focus:border-[#009B4C] transition-all text-sm font-semibold text-gray-900 appearance-none cursor-pointer pr-12"
                >
                  <option value="" disabled hidden></option>
                  <option value="Malang">Malang</option>
                  <option value="Blitar">Blitar</option>
                  <option value="Kediri 1">Kediri 1</option>
                  <option value="Kediri 2">Kediri 2</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <CaretDown size={16} weight="bold" />
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Buttons wrapper matching Image 2 */}
      {!isLoading && (
        <div className="flex gap-4 max-w-5xl mx-auto w-full animate-in fade-in duration-200">
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
            disabled={isSaving}
            className="flex-1 py-4 bg-[#009B4C] hover:bg-[#008741] text-white rounded-2xl text-sm font-bold active:scale-[0.98] transition-all shadow-md cursor-pointer text-center disabled:opacity-60"
          >
            {isSaving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      )}
    </div>
  );
}
