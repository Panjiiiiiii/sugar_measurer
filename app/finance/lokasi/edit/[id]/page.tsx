"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react";

// Mock locations data lookup
const mockLocations: Record<string, { nama: string; accountNumber: string; balance: string }> = {
  "1": { nama: "Malang", accountNumber: "5221068236989225", balance: "100000000" },
  "2": { nama: "Blitar", accountNumber: "5221068236989225", balance: "100000000" },
  "3": { nama: "Kediri 1", accountNumber: "5221068236989225", balance: "100000000" },
  "4": { nama: "Kediri 2", accountNumber: "5221068236989225", balance: "100000000" },
};

export default function EditLokasiPage() {
  const params = useParams();
  const router = useRouter();
  const idRaw = (params.id as string) || "1";
  const id = idRaw.toLowerCase();

  const [formData, setFormData] = useState({
    nama: "",
    accountNumber: "",
    balance: ""
  });

  // Pre-populate data based on the dynamic route ID parameter
  useEffect(() => {
    if (id && mockLocations[id]) {
      setFormData({
        nama: mockLocations[id].nama,
        accountNumber: mockLocations[id].accountNumber,
        balance: mockLocations[id].balance
      });
    } else {
      // Fallback
      setFormData({
        nama: "Lokasi Baru",
        accountNumber: "5221068236989225",
        balance: "100000000"
      });
    }
  }, [id]);

  const isFormValid = formData.nama.trim() !== "" && formData.accountNumber.trim() !== "" && formData.balance.trim() !== "";

  const handleSave = () => {
    if (!isFormValid) return;
    // Simulate save by routing back to data lokasi page with success query
    router.push("/finance/lokasi?success=true");
  };

  return (
    <div className="p-8 space-y-8 bg-[#F9FAFB] min-h-[calc(100vh-72px)] w-full">
      {/* Header & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Lokasi</h1>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <span 
            onClick={() => router.push("/finance/lokasi")}
            className="hover:text-gray-900 cursor-pointer transition-colors"
          >
            Data Lokasi
          </span>
          <CaretRight size={10} weight="bold" className="text-gray-300" />
          <span className="text-gray-900">Edit Lokasi</span>
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
                Nama Lokasi
              </label>
              <input 
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
              />
            </div>

            {/* Account Number */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-950 block">
                Account Number
              </label>
              <input 
                type="text"
                value={formData.accountNumber || ""}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, "") })}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
              />
            </div>

            {/* Balance */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-950 block">
                Balance (IDR)
              </label>
              <input 
                type="number"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
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
