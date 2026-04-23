"use client";

import React from "react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
}

export default function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  message = "Apakah anda yakin ingin menghapus riwayat timbangan ini?"
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-[480px] rounded-[32px] shadow-2xl overflow-hidden p-10 flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Message */}
        <h2 className="text-xl font-bold text-gray-900 text-center leading-relaxed max-w-[300px]">
          {message}
        </h2>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 w-full">
          <button 
            onClick={onClose}
            className="flex-1 py-4 px-6 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all transform active:scale-[0.98]"
          >
            Batal
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-4 px-6 bg-[#FF0000] rounded-xl text-sm font-bold text-white hover:bg-red-700 shadow-lg shadow-red-100 transition-all transform active:scale-[0.98]"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
