"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import Breadcrumb from "@/components/dashboard/Breadcrumb";

export default function ProfilePage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="max-w-[960px] mx-auto space-y-5">
      {/* Page Header Outside Card */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/branch/dashboard" },
            { label: "Profile" }
          ]}
        />
      </div>

      <div className="bg-white rounded-[20px] border border-gray-100 overflow-hidden shadow-sm">
        {/* Inner Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">Profile</h2>
        </div>

        {/* Content */}
        <div className="p-8 lg:p-10 flex flex-col md:flex-row gap-8 lg:gap-14">
          {/* Left: Avatar Area */}
          <div className="flex flex-col items-center">
            <div className="relative w-28 h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-[6px] border-gray-50 bg-gray-100 shadow-sm">
              <Image
                src="https://avatar.iran.liara.run/public/boy?username=Dadang"
                alt="Profile Avatar"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Right: Form Area */}
          <div className="flex-1 flex flex-col gap-5">
            {/* Nama */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800 ml-0.5">
                Nama
              </label>
              <input
                type="text"
                defaultValue="Dadang Utama Jaya"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#009253] transition-all"
              />
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800 ml-0.5">
                Username
              </label>
              <input
                type="text"
                defaultValue="dadangjaya21"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#009253] transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800 ml-0.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  defaultValue="dadangjaya21"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#009253] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-800 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
                </button>
              </div>
            </div>

            {/* Buttons Row */}
            <div className="flex items-center gap-3 mt-3">
              <button
                type="button"
                className="flex-1 px-8 py-2.5 rounded-lg border border-gray-100 bg-white text-gray-900 font-bold hover:bg-gray-50 transition-all text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 px-8 py-2.5 rounded-lg bg-[#009253] text-white font-bold hover:bg-[#007d47] transition-all text-xs"
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
