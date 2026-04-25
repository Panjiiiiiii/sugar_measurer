"use client";

import React from "react";
import { X } from "@phosphor-icons/react";

interface EditHargaModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationName: string;
  currentPrice: string;
}

export default function EditHargaModal({ isOpen, onClose, locationName, currentPrice }: EditHargaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-[480px] rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col">
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-center relative">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Harga Tebu</h2>
          <button 
            onClick={onClose}
            className="absolute right-8 top-8 p-1 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div className="px-10 pb-10 flex flex-col gap-6">
          <div className="flex flex-col gap-2.5">
            <label className="text-[13px] font-bold text-gray-900 tracking-tight ml-1">Input Harga</label>
            <input 
              type="text" 
              placeholder="Rp 0"
              defaultValue={currentPrice}
              className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/30 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 w-full">
            <button 
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl border border-gray-100 bg-white text-gray-900 font-bold hover:bg-gray-50 transition-all text-sm tracking-tight"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                console.log("Saving price...");
                onClose();
              }}
              className="flex-1 py-4 rounded-2xl bg-[#009253] text-white font-bold hover:bg-[#007a45] transition-all text-sm tracking-tight shadow-lg shadow-green-100"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
