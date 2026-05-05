"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/dashboard/Breadcrumb";
import { CalendarBlank, UploadSimple, CaretDown, CheckCircle, Trash } from "@phosphor-icons/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

export default function EditTransferPage() {
  const router = useRouter();
  const params = useParams();
  const role = Array.isArray(params.role) ? params.role[0] : (params.role || "finance");
  
  const [formData, setFormData] = useState({
    tanggal: "2026-04-16",
    nominal: "Rp 100.000.000",
    cabang: "Malang",
  });
  const [file, setFile] = useState<string | null>("/bukti_transfer.png");
  const [showSuccess, setShowSuccess] = useState(false);

  const isFormValid = formData.tanggal !== "" && formData.nominal !== "" && formData.cabang !== "" && file !== null;

  const handleSimpan = () => {
    if (isFormValid) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push(`/${role}/transfer`);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col gap-8 relative">
      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[10000] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#009253] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-green-400/20">
            <CheckCircle size={24} weight="fill" />
            <span className="font-bold tracking-tight">Data berhasil diubah</span>
          </div>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Transaksi</h1>
        <Breadcrumb 
          items={[
            { label: "Dashboard", href: `/${role}` },
            { label: "Riwayat Transfer", href: `/${role}/transfer` },
            { label: "Edit Transaksi" }
          ]} 
        />
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden transition-all">
        <div className="px-8 py-6 border-b border-gray-50">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Form Edit Transaksi</h2>
        </div>

        <div className="p-10 flex flex-col gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-gray-900 ml-1">Tanggal</label>
            <div className="relative group">
              <input 
                type="date"
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/30 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-sm text-gray-900 shadow-sm"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <CalendarBlank size={22} weight="bold" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-gray-900 ml-1">Nominal</label>
            <input 
              type="text"
              className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/30 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-sm text-gray-900 shadow-sm"
              value={formData.nominal}
              onChange={(e) => setFormData({ ...formData, nominal: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-gray-900 ml-1">Upload Bukti Transfer</label>
            {file ? (
              <div className="relative w-full aspect-[16/9] md:aspect-[21/9] group rounded-[24px] overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
                <Image src={file} alt="Bukti Transfer Preview" fill className="object-contain p-4" priority />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <button onClick={() => setFile(null)} className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-xl">
                    <Trash size={20} weight="bold" />
                    Hapus & Ganti
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative group border-2 border-dashed border-gray-200 rounded-[24px] hover:border-blue-500 hover:bg-blue-50/10 transition-all cursor-pointer overflow-hidden">
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) setFile(URL.createObjectURL(selectedFile));
                }} />
                <div className="flex flex-col items-center justify-center gap-4 py-16">
                  <div className="p-4 bg-gray-50 rounded-2xl text-gray-900 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <UploadSimple size={32} weight="bold" />
                  </div>
                  <p className="text-sm font-bold text-gray-400 group-hover:text-blue-500 transition-all">Upload Bukti Transfer</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-gray-900 ml-1">Cabang</label>
            <div className="relative group">
              <select className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/30 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-sm text-gray-900 appearance-none cursor-pointer" value={formData.cabang} onChange={(e) => setFormData({ ...formData, cabang: e.target.value })}>
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

      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="flex-1 py-4.5 bg-white border border-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm text-sm tracking-tight text-center">
          Cancel
        </button>
        <button disabled={!isFormValid} onClick={handleSimpan} className={`flex-1 py-4.5 rounded-2xl font-bold transition-all text-sm tracking-tight ${isFormValid ? "bg-[#009253] text-white hover:bg-[#007a45] shadow-lg shadow-green-100 active:scale-[0.98]" : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"}`}>
          Simpan
        </button>
      </div>
    </div>
  );
}
