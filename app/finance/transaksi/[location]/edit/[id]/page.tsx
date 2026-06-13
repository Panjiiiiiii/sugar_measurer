"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Trash
} from "@phosphor-icons/react";

export default function EditTransaksiPage() {
  const params = useParams();
  const router = useRouter();
  const location = (params?.location as string) || "";
  const id = params?.id as string;
  
  const getCityName = (id: string) => {
    const map: Record<string, string> = {
      "loc-1": "Malang",
      "loc-2": "Blitar",
      "loc-3": "Kediri 1",
      "loc-4": "Kediri 2",
      "malang": "Malang",
      "blitar": "Blitar",
      "kediri-1": "Kediri 1",
      "kediri-2": "Kediri 2",
    };
    return map[id] || id.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const locationName = getCityName(location);

  const [nominal, setNominal] = React.useState("100000000");

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanValue = value.replace(/\D/g, "");
    setNominal(cleanValue);
  };

  return (
    <div className="space-y-8">
      {/* Header & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Transaksi</h1>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <span 
            onClick={() => router.push(`/finance/transaksi/${location}`)}
            className="hover:text-gray-900 cursor-pointer transition-colors"
          >
            Data Transaksi {locationName}
          </span>
          <span className="text-gray-300">&gt;</span>
          <span className="text-gray-900">Edit Transaksi</span>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-white">
            <h2 className="text-lg font-bold text-gray-900">Form Input Transaksi</h2>
          </div>
          
          <div className="p-8 space-y-8">
            {/* Tanggal */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900 block">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <input 
                  type="date"
                  defaultValue="2026-04-16"
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  style={{ colorScheme: 'light' }}
                />
                <Calendar 
                  size={20} 
                  weight="bold" 
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600 transition-colors"
                />
              </div>
            </div>

            {/* Nominal */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900 block">
                Nominal <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                value={nominal || ""}
                onChange={handleNominalChange}
                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Uploaded File Display */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-900 block">
                Upload Bukti Transfer <span className="text-red-500">*</span>
              </label>
              <div className="relative w-fit">
                <div className="w-[120px] h-[120px] rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
                  <img 
                    src="/bukti-transfer.png" 
                    alt="Current Bukti Transfer" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors">
                  <Trash size={16} weight="bold" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => router.back()}
            className="w-full py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button 
            className="w-full py-4 bg-[#019246] text-white rounded-2xl text-sm font-bold hover:bg-[#017a3a] transition-all shadow-lg"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
