"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react";

export default function InputLokasiPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    sugar_price: "",
    account_balance: "",
    account_number: "",
  });

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.sugar_price.trim() !== "" &&
    formData.account_number.trim() !== "";

  const handleSave = async () => {
    if (!isFormValid) return;

    setIsSaving(true);

    try {
      const response = await fetch("/api/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          sugar_price: Number(formData.sugar_price),
          account_balance: formData.account_balance.trim()
            ? Number(formData.account_balance)
            : 0,
          account_number: formData.account_number.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save location");
      }

      router.push("/finance/lokasi?success=true");
    } catch (error) {
      console.error("Error saving location:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#F9FAFB] min-h-[calc(100vh-72px)] w-full">
      {/* Header & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Input Lokasi</h1>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <span 
            onClick={() => router.push("/finance/lokasi")}
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
                placeholder="Masukkan nama lokasi (e.g. Malang)"
              />
            </div>

            {/* Sugar Price */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-950 block">
                Harga Tebu <span className="text-red-500 font-bold">*</span>
              </label>
              <input 
                type="number"
                value={formData.sugar_price}
                onChange={(e) => setFormData({ ...formData, sugar_price: e.target.value })}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
                placeholder="Masukkan harga gula"
              />
            </div>

            {/* Account Number */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-950 block">
                Nomor Rekening <span className="text-red-500 font-bold">*</span>
              </label>
              <input 
                type="number"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value.replace(/\D/g, "") })}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
                placeholder="Masukkan nomor rekening lokasi"
              />
            </div>

            {/* Account Balance */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-950 block">
                Saldo Awal (IDR)
              </label>
              <input 
                type="number"
                value={formData.account_balance}
                onChange={(e) => setFormData({ ...formData, account_balance: e.target.value })}
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
            Batal
          </button>
          <button 
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
            className={`w-full py-4 text-white rounded-2xl text-sm font-bold transition-all shadow-md ${
              isFormValid && !isSaving
                ? "bg-[#009262] hover:bg-[#007a52] active:bg-[#006342] cursor-pointer" 
                : "bg-gray-300 cursor-not-allowed shadow-none"
            }`}
            suppressHydrationWarning
          >
            {isSaving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
