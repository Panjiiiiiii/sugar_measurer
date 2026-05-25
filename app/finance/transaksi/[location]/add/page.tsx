"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  UploadSimple,
  Calendar
} from "@phosphor-icons/react";

export default function InputTransaksiPage() {
  const params = useParams();
  const router = useRouter();
  const location = (params?.location as string) || "";
  const locationName = location.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="p-8 space-y-8">
      {/* Header & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Input Transaksi</h1>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <span 
            onClick={() => router.push(`/finance/transaksi/${location}`)}
            className="hover:text-gray-900 cursor-pointer transition-colors"
          >
            Data Transaksi {locationName}
          </span>
          <span className="text-gray-300">&gt;</span>
          <span className="text-gray-900">Input Transaksi</span>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-white">
            <h2 className="text-lg font-bold text-gray-900">Form Transaksi</h2>
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
                placeholder="Masukkan nominal"
                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Upload */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-900 block">
                Upload Bukti Transfer <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-100 rounded-[32px] p-20 flex flex-col items-center justify-center gap-4 hover:bg-gray-50 transition-all cursor-pointer group relative overflow-hidden">
                <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-white transition-colors">
                  <UploadSimple size={48} weight="bold" className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                </div>
                <span className="text-sm font-bold text-gray-400 group-hover:text-gray-900 transition-colors">Upload Bukti Transfer</span>
                <input 
                  type="file" 
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
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
