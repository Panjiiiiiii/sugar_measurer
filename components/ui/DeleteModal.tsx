"use client";

import React from "react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
}

export function DeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  message = "Apakah anda yakin ingin menghapus data ini?"
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[4px] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-[500px] rounded-[40px] shadow-2xl overflow-hidden p-12 flex flex-col items-center gap-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Message */}
        <h2 className="text-[22px] font-bold text-gray-900 text-center leading-[1.4] max-w-[340px] tracking-tight">
          {message}
        </h2>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 w-full">
          <button 
            onClick={onClose}
            className="flex-1 py-4.5 px-6 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all transform active:scale-[0.98] shadow-sm h-[60px] flex items-center justify-center"
          >
            Batal
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-4.5 px-6 bg-[#FF0000] rounded-2xl text-sm font-bold text-white hover:bg-red-700 shadow-lg shadow-red-100 transition-all transform active:scale-[0.98] h-[60px] flex items-center justify-center"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
