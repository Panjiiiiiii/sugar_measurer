"use client";

import React, { useState } from "react";
import { X, CaretDown } from "@phosphor-icons/react";

interface TrukFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: { type: string; ownership: string }) => void;
}

export default function TrukFilterModal({ isOpen, onClose, onApply }: TrukFilterModalProps) {
  const [filters, setFilters] = useState({
    type: "Engkel",
    ownership: "Private",
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-[440px] rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-gray-50">
          <div className="w-6" /> {/* Spacer */}
          <h2 className="text-xl font-bold text-gray-900">Filter</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col gap-6">
          {/* Type Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-900">Type</label>
            <div className="relative">
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all font-medium text-gray-700"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="Engkel">Engkel</option>
                <option value="Double">Double</option>
                <option value="Trailer">Trailer</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <CaretDown size={18} weight="bold" />
              </div>
            </div>
          </div>

          {/* Ownership Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-900">Ownership</label>
            <div className="relative">
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all font-medium text-gray-700"
                value={filters.ownership}
                onChange={(e) => setFilters({ ...filters, ownership: e.target.value })}
              >
                <option value="Private">Private</option>
                <option value="Company">Company</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <CaretDown size={18} weight="bold" />
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <button 
            onClick={() => onApply(filters)}
            className="w-full py-4 bg-[#009262] text-white rounded-2xl font-bold hover:bg-[#007a52] transition-colors mt-2"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}
