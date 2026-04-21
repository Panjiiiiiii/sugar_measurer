"use client";

import React, { useState } from "react";
import { X, CalendarBlank, ArrowRight, CaretDown } from "@phosphor-icons/react";

interface NotificationFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: any) => void;
}

export default function NotificationFilterModal({ isOpen, onClose, onApply }: NotificationFilterModalProps) {
  const [dates, setDates] = useState({
    start: "2026-03-11",
    end: "2026-04-11",
  });
  const [status, setStatus] = useState("Belum dibaca");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-[520px] rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-gray-50">
          <div className="w-6" /> {/* Spacer */}
          <h2 className="text-xl font-bold text-gray-900 leading-none">Filter</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div className="p-10 flex flex-col gap-8">
          {/* Date Range Group */}
          <div className="flex items-center gap-4">
            {/* Start Date */}
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-[11px] font-bold text-gray-900 ml-1">Awal tanggal</label>
              <div className="relative">
                <input 
                  type="date"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-100 bg-white font-medium text-xs text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#009253] transition-all shadow-sm"
                  value={dates.start}
                  onChange={(e) => setDates({ ...dates, start: e.target.value })}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <CalendarBlank size={18} weight="bold" />
                </div>
              </div>
            </div>

            {/* Separator Arrow */}
            <div className="pt-6 text-gray-300">
              <ArrowRight size={20} weight="bold" />
            </div>

            {/* End Date */}
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-[11px] font-bold text-gray-900 ml-1">Akhir tanggal</label>
              <div className="relative">
                <input 
                  type="date"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-100 bg-white font-medium text-xs text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#009253] transition-all shadow-sm"
                  value={dates.end}
                  onChange={(e) => setDates({ ...dates, end: e.target.value })}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <CalendarBlank size={18} weight="bold" />
                </div>
              </div>
            </div>
          </div>

          {/* Status Dropdown Group */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-gray-900 ml-1">Notifikasi</label>
            <div className="relative">
              <select 
                className="w-full px-5 py-3.5 rounded-xl border border-gray-100 bg-white font-medium text-xs text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#009253] transition-all shadow-sm cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Belum dibaca">Belum dibaca</option>
                <option value="Sudah dibaca">Sudah dibaca</option>
                <option value="Semua">Semua</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <CaretDown size={18} weight="bold" />
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <button 
            onClick={() => onApply({ dates, status })}
            className="w-full py-4 mt-2 bg-[#009253] text-white rounded-2xl font-bold hover:bg-[#007d47] transition-all shadow-lg shadow-green-900/10 active:scale-[0.98]"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}
