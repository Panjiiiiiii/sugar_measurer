"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/dashboard/Breadcrumb";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nama: "Dadang Utama Jaya",
    username: "dadangjaya21",
    password: "password123", // Dummy password
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Profile</h1>
        <Breadcrumb 
          items={[
            { label: "Dashboard", href: "/finance/dashboard" },
            { label: "Profile" }
          ]} 
        />
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden transition-all">
        {/* Card Header */}
        <div className="px-8 py-6 border-b border-gray-50">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Profile</h2>
        </div>

        {/* Card Body */}
        <div className="p-10 flex flex-col md:flex-row items-start gap-12 max-w-5xl mx-auto">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-gray-50 shadow-sm bg-gray-100">
              <Image 
                src="https://avatar.iran.liara.run/public/boy?username=Dadang"
                alt="Profile Avatar"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Form Section */}
          <div className="flex-1 w-full flex flex-col gap-8">
            {/* Nama */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-gray-900 ml-1">Nama</label>
              <input 
                type="text"
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/30 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-sm text-gray-900 shadow-sm"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>

            {/* Username */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-gray-900 ml-1">Username</label>
              <input 
                type="text"
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/30 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-sm text-gray-900 shadow-sm"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-gray-900 ml-1">Password</label>
              <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/30 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-sm text-gray-900 shadow-sm"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  {showPassword ? <EyeSlash size={20} weight="bold" /> : <Eye size={20} weight="bold" />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 mt-4">
              <button 
                onClick={() => router.back()}
                className="flex-1 py-4.5 bg-white border border-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm text-sm tracking-tight text-center"
              >
                Cancel
              </button>
              <button 
                className="flex-1 py-4.5 bg-[#009253] text-white rounded-2xl font-bold hover:bg-[#007a45] transition-all shadow-lg shadow-green-100 text-sm tracking-tight"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
