"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/dashboard/Breadcrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CaretDown, CreditCard } from "@phosphor-icons/react";

export default function InputTrukPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nopol: "",
    namaTruk: "",
    namaPemilik: "",
    ownership: "",
    accountNumber: "",
  });

  // Validation logic
  const isFormValid = 
    form.nopol.trim() !== "" && 
    form.namaTruk.trim() !== "" && 
    form.namaPemilik.trim() !== "" && 
    form.ownership !== "" && 
    form.accountNumber.trim() !== "";

  const handleSave = () => {
    if (isFormValid) {
      // Simulate save and redirect
      router.push("/branch/truk?success=true");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Top section: Title and Breadcrumb */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Input Truk</h1>
        <Breadcrumb 
          items={[
            { label: "Dashboard", href: "/branch/dashboard" },
            { label: "Truk", href: "/branch/truk" },
            { label: "Input Truk" }
          ]} 
        />
      </div>

      {/* Main Card: Form Truk */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-50 bg-white">
          <h3 className="text-lg font-bold text-gray-900">Form Truk</h3>
        </div>
        <div className="p-8 flex flex-col gap-6 max-w-full">
          {/* Nopol */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-900">Nopol</label>
            <input
              type="text"
              placeholder="Input Nopol"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700 placeholder:text-gray-300"
              value={form.nopol}
              onChange={(e) => setForm({ ...form, nopol: e.target.value })}
            />
          </div>

          {/* Nama Truk */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-900">Nama Truk</label>
            <input
              type="text"
              placeholder="Input Nama Truk"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700 placeholder:text-gray-300"
              value={form.namaTruk}
              onChange={(e) => setForm({ ...form, namaTruk: e.target.value })}
            />
          </div>

          {/* Nama Pemilik */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-900">Nama Pemilik</label>
            <input
              type="text"
              placeholder="Input Nama Pemilik"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700 placeholder:text-gray-300"
              value={form.namaPemilik}
              onChange={(e) => setForm({ ...form, namaPemilik: e.target.value })}
            />
          </div>

          {/* Ownership */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-900">Ownership</label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700 appearance-none cursor-pointer"
                value={form.ownership}
                onChange={(e) => setForm({ ...form, ownership: e.target.value })}
              >
                <option value="" disabled>Select ownership</option>
                <option value="Private">Private</option>
                <option value="Company">Company</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <CaretDown size={18} weight="bold" />
              </div>
            </div>
          </div>

          {/* Input with Payment */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-900">Input with Payment</label>
            <div className="relative flex items-center">
              <div className="absolute left-4 z-10 flex items-center gap-1">
                <div className="w-5 h-3 bg-[#EB001B] rounded-sm opacity-80" />
                <div className="w-5 h-3 bg-[#F79E1B] rounded-sm -ml-2 opacity-80" />
              </div>
              <input
                type="text"
                placeholder="Card number"
                className="w-full pl-14 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700 placeholder:text-gray-300"
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        <Link 
          href="/branch/truk"
          className="w-full py-4 rounded-xl border border-gray-200 bg-white text-gray-900 font-bold text-center hover:bg-gray-50 transition-all"
        >
          Cancel
        </Link>
        <button
          onClick={handleSave}
          disabled={!isFormValid}
          className={`w-full py-4 rounded-xl font-bold text-center transition-all ${
            isFormValid 
              ? "bg-[#009262] text-white hover:bg-[#007a52] cursor-pointer" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Simpan
        </button>
      </div>
    </div>
  );
}
