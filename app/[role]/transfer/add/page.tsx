"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/dashboard/Breadcrumb";
import { CalendarBlank, UploadSimple, CaretDown, CheckCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AddTransferPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    tanggal: "",
    nominal: "",
    cabang: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const isFormValid = formData.tanggal !== "" && formData.nominal !== "" && formData.cabang !== "" && file !== null;

  const handleSimpan = () => {
    if (isFormValid) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push("/finance/transfer");
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col gap-8 relative">
      <style jsx global>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
          opacity: 0;
        }
      `}</style>
      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[10000] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#009253] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-green-400/20">
            <CheckCircle size={24} weight="fill" />
            <span className="font-bold tracking-tight">Data berhasil disimpan</span>
          </div>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Input Transaksi</h1>
        <Breadcrumb 
          items={[
            { label: "Dashboard", href: "/finance/dashboard" },
            { label: "Riwayat Transfer", href: "/finance/transfer" },
            { label: "Input Transaksi" }
          ]} 
        />
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden transition-all">
        {/* Card Header */}
        <div className="px-8 py-6 border-b border-gray-50">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Form Input Transaksi</h2>
        </div>

        {/* Card Body */}
        <div className="p-10 flex flex-col gap-8 max-w-4xl mx-auto">
          {/* Tanggal */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-gray-900 ml-1 italic after:content-['*'] after:text-red-500 after:ml-0.5">Tanggal</label>
            <div className="relative group">
              <input 
                type="date"
                required
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/30 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-sm text-gray-900 shadow-sm appearance-none"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <CalendarBlank size={22} weight="bold" />
              </div>
            </div>
          </div>

          {/* Nominal */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-gray-900 ml-1 italic after:content-['*'] after:text-red-500 after:ml-0.5">Nominal</label>
            <input 
              type="text"
              required
              placeholder="Masukkan nominal"
              className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/30 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-sm text-gray-900 shadow-sm"
              value={formData.nominal}
              onChange={(e) => setFormData({ ...formData, nominal: e.target.value })}
            />
          </div>

          {/* Upload Bukti Transfer */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-gray-900 ml-1 italic after:content-['*'] after:text-red-500 after:ml-0.5">Upload Bukti Transfer</label>
            <div className={`relative group border-2 border-dashed rounded-[24px] transition-all cursor-pointer overflow-hidden ${
              file ? "border-green-500 bg-green-50/10" : "border-gray-200 hover:border-blue-500 hover:bg-blue-50/10"
            }`}>
              <input 
                type="file"
                required
                accept=".jpg, .jpeg"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
                    if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
                      setFile(selectedFile);
                    } else {
                      alert("Hanya file .jpg yang diperbolehkan");
                      e.target.value = "";
                      setFile(null);
                    }
                  }
                }}
              />
              <div className="flex flex-col items-center justify-center gap-4 py-16">
                <div className={`p-4 rounded-2xl transition-all ${
                  file ? "bg-green-500 text-white" : "bg-gray-50 text-gray-900 group-hover:bg-blue-500 group-hover:text-white"
                }`}>
                  <UploadSimple size={32} weight="bold" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className={`text-sm font-bold transition-all ${
                    file ? "text-green-600" : "text-gray-400 group-hover:text-blue-500"
                  }`}>
                    {file ? file.name : "Upload Bukti Transfer"}
                  </p>
                  {file && <p className="text-[11px] text-green-500/60 font-semibold">File ready to save</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Cabang */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-gray-900 ml-1 italic after:content-['*'] after:text-red-500 after:ml-0.5">Cabang</label>
            <div className="relative group">
              <select 
                required
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/30 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-sm text-gray-900 shadow-sm appearance-none cursor-pointer"
                value={formData.cabang}
                onChange={(e) => setFormData({ ...formData, cabang: e.target.value })}
              >
                <option value="" disabled>Select cabang</option>
                <option value="Malang">Malang</option>
                <option value="Blitar">Blitar</option>
                <option value="Kediri 1">Kediri 1</option>
                <option value="Kediri 2">Kediri 2</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <CaretDown size={20} weight="bold" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="flex-1 py-4.5 bg-white border border-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm text-sm tracking-tight text-center"
        >
          Cancel
        </button>
        <button 
          disabled={!isFormValid}
          onClick={handleSimpan}
          className={`flex-1 py-4.5 rounded-2xl font-bold transition-all text-sm tracking-tight ${
            isFormValid 
              ? "bg-[#009253] text-white hover:bg-[#007a45] shadow-lg shadow-green-100 active:scale-[0.98]" 
              : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
          }`}
        >
          Simpan
        </button>
      </div>
    </div>
  );
}
