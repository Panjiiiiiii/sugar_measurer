"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/dashboard/Breadcrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InputTimbanganPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nopol: "",
    bruto: "",
    tara: "",
  });

  const bruto = parseFloat(form.bruto) || 0;
  const tara = parseFloat(form.tara) || 0;
  const netto = bruto - tara;

  // Formatting netto for display
  const nettoDisplay = netto > 0 ? `${netto} ton` : "0 ton";

  // Validation logic
  const isFormValid = form.nopol.trim() !== "" && form.bruto.trim() !== "" && form.tara.trim() !== "";

  const handleSave = () => {
    if (isFormValid) {
      // Small delay to simulate processing if needed, then redirect
      router.push("/branch/timbangan?success=true");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Top section: Title and Breadcrumb */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Input Timbangan</h1>
        <Breadcrumb 
          items={[
            { label: "Dashboard", href: "/branch/dashboard" },
            { label: "Timbangan", href: "/branch/timbangan" },
            { label: "Input Timbangan" }
          ]} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Card: Form Timbangan */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-50 bg-white">
            <h3 className="text-lg font-bold text-gray-900 text-center md:text-left">Form Timbangan</h3>
          </div>
          <div className="p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-900">Input Nopol</label>
              <input
                type="text"
                placeholder="N 1234 AC"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={form.nopol}
                onChange={(e) => setForm({ ...form, nopol: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-900">Bruto</label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={form.bruto}
                onChange={(e) => setForm({ ...form, bruto: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-900">Tara</label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={form.tara}
                onChange={(e) => setForm({ ...form, tara: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Right Card: Output Timbangan */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-50 bg-white">
            <h3 className="text-lg font-bold text-gray-900 text-center md:text-left">Output Timbangan</h3>
          </div>
          <div className="p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-900">Output Netto</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-semibold focus:outline-none"
                value={nettoDisplay}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-900">Output Harga</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-semibold focus:outline-none"
                value={netto > 0 ? `${netto} m` : "0 m"}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        <Link 
          href="/branch/timbangan"
          className="w-full py-4 rounded-xl border border-gray-200 bg-white text-gray-900 font-bold text-center hover:bg-gray-50 transition-all"
        >
          Batal
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
