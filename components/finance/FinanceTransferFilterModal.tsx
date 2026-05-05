"use client";

import React, { useState } from "react";
import { X, ArrowRight } from "@phosphor-icons/react";

interface FinanceTransferFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: { start: string; end: string; branch: string }) => void;
  initialFilters?: { start: string; end: string; branch: string };
}

export default function FinanceTransferFilterModal({ isOpen, onClose, onApply, initialFilters }: FinanceTransferFilterModalProps) {
  const [filters, setFilters] = useState({
    start: initialFilters?.start || "2026-03-11",
    end: initialFilters?.end || "2026-04-11",
    branch: initialFilters?.branch || "",
  });

  React.useEffect(() => {
    if (isOpen && initialFilters) {
      setFilters(initialFilters);
    }
  }, [isOpen, initialFilters]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-[500px] rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-10 pt-10 pb-6 flex items-center justify-center relative">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Filter</h2>
          <button 
            onClick={onClose}
            className="absolute right-10 top-10 p-1 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div className="px-10 pb-10 flex flex-col gap-8">
          {/* Date Range */}
          <div className="flex items-center gap-4">
            {/* Start Date */}
            <div className="flex-1 flex flex-col gap-2.5">
              <label className="text-[13px] font-bold text-gray-900 ml-1 tracking-tight">Awal tanggal</label>
              <input 
                type="date"
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/30 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-sm text-gray-900 shadow-sm"
                value={filters.start}
                onChange={(e) => setFilters({ ...filters, start: e.target.value })}
              />
            </div>

            {/* Separator Arrow */}
            <div className="pt-8 text-gray-300">
              <ArrowRight size={20} weight="bold" />
            </div>

            {/* End Date */}
            <div className="flex-1 flex flex-col gap-2.5">
              <label className="text-[13px] font-bold text-gray-900 ml-1 tracking-tight">Akhir tanggal</label>
              <input 
                type="date"
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/30 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-sm text-gray-900 shadow-sm"
                value={filters.end}
                onChange={(e) => setFilters({ ...filters, end: e.target.value })}
              />
            </div>
          </div>

          {/* Branch Select */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[13px] font-bold text-gray-900 ml-1 tracking-tight">Cabang</label>
            <div className="relative group">
              <select 
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/30 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-sm text-gray-900 shadow-sm appearance-none cursor-pointer"
                value={filters.branch}
                onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
              >
                <option value="">Semua Cabang</option>
                <option value="Malang">Malang</option>
                <option value="Blitar">Blitar</option>
                <option value="Kediri 1">Kediri 1</option>
                <option value="Kediri 2">Kediri 2</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.6667 4.66669L7.00004 9.33335L2.33337 4.66669" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                const resetFilters = {
                  start: "",
                  end: "",
                  branch: "",
                };
                setFilters(resetFilters);
                onApply(resetFilters);
                onClose();
              }}
              className="flex-1 py-4.5 bg-white border border-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm text-sm tracking-tight text-center"
            >
              Reset
            </button>
            <button 
              onClick={() => {
                onApply(filters);
                onClose();
              }}
              className="flex-1 py-4.5 bg-[#009253] text-white rounded-2xl font-bold hover:bg-[#007a45] transition-all shadow-lg shadow-green-100 text-sm tracking-tight"
            >
              Terapkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
