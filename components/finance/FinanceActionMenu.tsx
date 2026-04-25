"use client";

import React from "react";

interface FinanceActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onViewReceipt: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function FinanceActionMenu({ isOpen, onClose, onViewReceipt, onEdit, onDelete }: FinanceActionMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-[100] py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
      <button 
        onClick={() => {
          onViewReceipt();
          onClose();
        }}
        className="w-full px-5 py-3 text-left text-xs font-bold text-gray-900 hover:bg-gray-50 transition-colors"
      >
        Lihat Bukti Transfer
      </button>
      <button 
        onClick={() => {
          onEdit();
          onClose();
        }}
        className="w-full px-5 py-3 text-left text-xs font-bold text-gray-900 border-t border-gray-50 hover:bg-gray-50 transition-colors"
      >
        Edit
      </button>
      <button 
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full px-5 py-3 text-left text-xs font-bold text-red-500 border-t border-gray-50 hover:bg-red-50 transition-colors"
      >
        Hapus
      </button>
    </div>
  );
}
