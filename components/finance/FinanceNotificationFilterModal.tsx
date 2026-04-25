"use client";

import React, { useState } from "react";
import { X, CalendarBlank, ArrowRight, CaretDown } from "@phosphor-icons/react";

interface FinanceNotificationFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: { start: string; end: string; status: string }) => void;
}

export default function FinanceNotificationFilterModal({ isOpen, onClose, onApply }: FinanceNotificationFilterModalProps) {
  const [dates, setDates] = useState({
    start: "2026-03-11",
    end: "2026-04-11",
  });
  const [status, setStatus] = useState("Belum dibaca");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
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
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[4px] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-[500px] rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-10 pt-10 pb-6 flex items-center justify-between">
          <div className="w-8" /> {/* Spacer */}
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Filter</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div className="px-10 pb-12 flex flex-col gap-10">
          {/* Date Range Group */}
          <div className="flex items-center gap-4">
            {/* Start Date */}
            <div className="flex-1 flex flex-col gap-3">
              <label className="text-[11px] font-bold text-gray-900 ml-1">Awal tanggal</label>
              <div className="relative group">
                <input 
                  type="date"
                  className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-white font-semibold text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-[#009253] transition-all shadow-sm"
                  value={dates.start}
                  onChange={(e) => setDates({ ...dates, start: e.target.value })}
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-[#009253] transition-colors">
                  <CalendarBlank size={18} weight="bold" />
                </div>
              </div>
            </div>

            {/* Separator Arrow */}
            <div className="pt-8 text-gray-300">
              <ArrowRight size={20} weight="bold" />
            </div>

            {/* End Date */}
            <div className="flex-1 flex flex-col gap-3">
              <label className="text-[11px] font-bold text-gray-900 ml-1">Akhir tanggal</label>
              <div className="relative group">
                <input 
                  type="date"
                  className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-white font-semibold text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-[#009253] transition-all shadow-sm"
                  value={dates.end}
                  onChange={(e) => setDates({ ...dates, end: e.target.value })}
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-[#009253] transition-colors">
                  <CalendarBlank size={18} weight="bold" />
                </div>
              </div>
            </div>
          </div>

          {/* Status Dropdown Group */}
          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-bold text-gray-900 ml-1">Notifikasi</label>
            <div className="relative group">
              <select 
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-white font-semibold text-xs text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-[#009253] transition-all shadow-sm cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Belum dibaca">Belum dibaca</option>
                <option value="Sudah dibaca">Sudah dibaca</option>
                <option value="Semua">Semua</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-[#009253] transition-colors">
                <CaretDown size={18} weight="bold" />
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <button 
            onClick={() => onApply({ ...dates, status })}
            className="w-full py-5 bg-[#009253] text-white rounded-[24px] font-bold hover:bg-[#007d47] transition-all shadow-lg shadow-green-900/10 active:scale-[0.98]"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}
