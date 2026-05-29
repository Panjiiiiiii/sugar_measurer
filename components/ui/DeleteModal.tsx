"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  message?: string;
  isLoading?: boolean;
}

export function DeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  message = "Apakah anda yakin ingin menghapus data ini?",
  isLoading = false,
}: DeleteModalProps) {
  const [localLoading, setLocalLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLocalLoading(true);
      await onConfirm();
      onClose();
    } finally {
      setLocalLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-[4px] animate-in fade-in duration-300"
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
            onClick={handleConfirm}
            disabled={localLoading || isLoading}
            className="flex-1 py-4.5 px-6 bg-[#FF0000] rounded-2xl text-sm font-bold text-white hover:bg-red-700 shadow-lg shadow-red-100 transition-all transform active:scale-[0.98] h-[60px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {localLoading || isLoading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
}
