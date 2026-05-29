"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react";

export default function InputLokasiRolePage() {
  const params = useParams();
  const router = useRouter();
  const roleRaw = params.role as string;
  const role = (!roleRaw || roleRaw === "undefined") ? "branch" : roleRaw;

  const [formData, setFormData] = useState({
    nama: "",
    accountNumber: "",
    balance: ""
  });

  const isFormValid = formData.nama.trim() !== "" && formData.accountNumber.trim() !== "" && formData.balance.trim() !== "";

  const handleSave = () => {
    if (!isFormValid) return;
    // Simulate save by routing back to data lokasi page with success query
    router.push(`/${role}/lokasi?success=true`);
  };

  return (
    <div className="flex flex-col w-full max-w-full pb-10">
      {/* Header & Breadcrumbs */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Input Lokasi</h1>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <span 
            onClick={() => router.push(`/${role}/lokasi`)}
            className="hover:text-gray-900 cursor-pointer transition-colors"
          >
            Data Lokasi
          </span>
          <CaretRight size={10} weight="bold" className="text-gray-300" />
          <span className="text-gray-900">Input Lokasi</span>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-5xl mx-auto space-y-6 w-full">
        <div className="bg-white border border-gray-100 rounded-[20px] shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 bg-white">
            <h2 className="text-base font-bold text-gray-900">Form Lokasi</h2>
          </div>
          
          <div className="p-8 space-y-6">
            {/* Nama Lokasi */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-950 block">
                Nama Lokasi <span className="text-red-500 font-bold">*</span>
              </label>
              <input 
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
                placeholder="Masukkan nama lokasi (e.g. Malang)"
              />
            </div>

            {/* Account Number */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-950 block">
                Account Number <span className="text-red-500 font-bold">*</span>
              </label>
              <input 
                type="text"
                value={formData.accountNumber || ""}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, "") })}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
                placeholder="Masukkan nomor rekening lokasi"
              />
            </div>

            {/* Balance */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-950 block">
                Balance (IDR) <span className="text-red-500 font-bold">*</span>
              </label>
              <input 
                type="number"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
                placeholder="Masukkan saldo awal lokasi"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => router.back()}
            className="w-full py-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 hover:bg-gray-50 active:bg-gray-100/80 transition-all shadow-sm cursor-pointer"
            suppressHydrationWarning
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!isFormValid}
            className={`w-full py-4 text-white rounded-2xl text-sm font-bold transition-all shadow-md ${
              isFormValid 
                ? "bg-[#009262] hover:bg-[#007a52] active:bg-[#006342] cursor-pointer" 
                : "bg-gray-300 cursor-not-allowed shadow-none"
            }`}
            suppressHydrationWarning
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
