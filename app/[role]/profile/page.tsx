"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import Breadcrumb from "@/components/dashboard/Breadcrumb";

export default function DynamicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const role = Array.isArray(params.role) ? params.role[0] : (params.role || "branch");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nama: "Dadang Utama Jaya",
    username: "dadangjaya21",
    password: "password123",
  });

  const [lastPage, setLastPage] = useState({ label: "Timbangan", href: `/${role}/timbangan` });

  React.useEffect(() => {
    const saved = sessionStorage.getItem("lastMainPage");
    if (saved) {
      setLastPage(JSON.parse(saved));
    }
  }, []);

  const breadcrumbItems = role === "finance"
    ? [
        { label: "Dashboard", href: "/finance/dashboard" },
        { label: "Profile" }
      ]
    : [
        { label: lastPage.label, href: lastPage.href },
        { label: "Profile" }
      ];

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      {/* Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Profile</h1>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden transition-all w-full">
        {/* Card Header */}
        <div className="px-8 py-5 border-b border-gray-100 bg-white">
          <h2 className="text-base font-bold text-gray-900">Profile</h2>
        </div>

        {/* Card Body */}
        <div className="p-8 flex flex-col md:flex-row items-start gap-12 max-w-4xl w-full">
          {/* Avatar Section */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
              <Image 
                src="https://avatar.iran.liara.run/public/boy?username=Dadang"
                alt="Profile Avatar"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Form Section */}
          <div className="flex-1 w-full flex flex-col gap-6">
            {/* Nama */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-950 block">Nama</label>
              <input 
                type="text"
                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-green-600 transition-all font-medium text-sm text-gray-800 shadow-sm"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>

            {/* Username */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-950 block">Username</label>
              <input 
                type="text"
                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-green-600 transition-all font-medium text-sm text-gray-800 shadow-sm"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-950 block">Password</label>
              <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"}
                  className="w-full px-5 py-3.5 pr-12 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-green-600 transition-all font-medium text-sm text-gray-800 shadow-sm"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button 
                type="button"
                className="w-full py-3.5 bg-white border border-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-50 active:scale-[0.98] transition-all text-sm cursor-pointer text-center"
                onClick={() => router.back()}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="w-full py-3.5 bg-[#009253] text-white rounded-xl font-bold hover:bg-[#007d47] active:scale-[0.98] transition-all text-sm cursor-pointer text-center"
                onClick={() => router.push(role === "finance" ? "/finance/dashboard?success=true" : `/${role}/timbangan?success=true`)}
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
