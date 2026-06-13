"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CaretDown, CaretRight } from "@phosphor-icons/react";

export default function InputCustomerPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    typeOwner: "",
    phoneNumber: "",
    specialPrice: "",
  });

  const isSpecialOwner = formData.typeOwner === "special";
  const isFormValid =
    formData.nama.trim() !== "" &&
    formData.typeOwner !== "" &&
    formData.phoneNumber.trim() !== "" &&
    (!isSpecialOwner || formData.specialPrice.trim() !== "");

  const handleSave = async () => {
    if (!isFormValid) return;

    setIsSaving(true);

    try {
      const response = await fetch("/api/owner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama_owner: formData.nama.trim(),
          type_ownership: formData.typeOwner,
          phone_number: formData.phoneNumber.trim(),
          ...(isSpecialOwner
            ? { special_price: Number(formData.specialPrice) }
            : {}),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create customer");
      }

      router.push("/finance/customer?success=true");
    } catch (error) {
      console.error("Error creating customer:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Input Customer</h1>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <span 
            onClick={() => router.push("/finance/customer")}
            className="hover:text-gray-900 cursor-pointer transition-colors"
          >
            Data Customer
          </span>
          <CaretRight size={10} weight="bold" className="text-gray-300" />
          <span className="text-gray-900">Input Customer</span>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white border border-gray-100 rounded-[20px] shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 bg-white">
            <h2 className="text-base font-bold text-gray-900">Form Customer</h2>
          </div>
          
          <div className="p-8 space-y-6">
            {/* Nama */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-950 block">
                Nama <span className="text-red-500 font-bold">*</span>
              </label>
              <input 
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
              />
            </div>

            {/* Type Owner */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-950 block">
                Tipe pemilik <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="relative group">
                <select 
                  value={formData.typeOwner}
                  onChange={(e) => setFormData({ ...formData, typeOwner: e.target.value })}
                  className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled hidden></option>
                  <option value="farmer">Petani</option>
                  <option value="private">Pribadi</option>
                  {/* <option value="special">Special</option> */}
                </select>
                <CaretDown 
                  size={16} 
                  weight="bold" 
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600 transition-colors"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-950 block">
                Nomor Telepon <span className="text-red-500 font-bold">*</span>
              </label>
              <input 
                type="number"
                value={formData.phoneNumber || ""}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, "") })}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
              />
            </div>

            {isSpecialOwner && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-950 block">
                  Harga Khusus <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={formData.specialPrice}
                  onChange={(e) => setFormData({ ...formData, specialPrice: e.target.value.replace(/\D/g, "") })}
                  className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
                  placeholder="Masukkan special price"
                />
              </div>
            )}

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
