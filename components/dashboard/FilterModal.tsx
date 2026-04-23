"use client";

import React, { useState } from "react";
import { X, CaretDown, ArrowRight } from "@phosphor-icons/react";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

export default function FilterModal({ isOpen, onClose, onApply }: FilterModalProps) {
  const [filters, setFilters] = useState({
    startDate: "2026-03-11",
    endDate: "2026-04-11",
    ownership: "Private",
    status: "Paid",
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-[480px] rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-center relative">
          <h2 className="text-xl font-bold text-gray-900">Filter</h2>
          <button 
            onClick={onClose}
            className="absolute right-8 top-8 p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col gap-6">
          {/* Date Range */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-900">Awal tanggal</label>
                <input 
                  type="date" 
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="mt-7 text-gray-300">
                <ArrowRight size={20} weight="bold" />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-900">Akhir tanggal</label>
                <input 
                  type="date" 
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Ownership */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-900">Ownership</label>
            <div className="relative">
              <select 
                value={filters.ownership}
                onChange={(e) => setFilters({ ...filters, ownership: e.target.value })}
                className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-gray-50 text-sm font-semibold text-gray-700 outline-none appearance-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="Private">Private</option>
                <option value="Company">Company</option>
                <option value="Shared">Shared</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <CaretDown size={18} weight="bold" />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-900">Status</label>
            <div className="relative">
              <select 
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-gray-50 text-sm font-semibold text-gray-700 outline-none appearance-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="All">All Status</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <CaretDown size={18} weight="bold" />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={() => onApply(filters)}
            className="w-full mt-2 py-4 bg-[#009262] text-white font-bold rounded-xl hover:bg-[#007a52] transition-all transform active:scale-[0.98]"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}
