"use client";

import React from "react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function LogoutModal({ isOpen, onClose, onLogout }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-[440px] rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 p-10 flex flex-col items-center gap-8">
        <h2 className="text-xl font-bold text-gray-900 text-center leading-tight">
          Apakah anda yakin ingin Log Out
        </h2>

        <div className="flex items-center gap-4 w-full">
          <button 
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl border border-gray-100 bg-white text-gray-900 font-bold hover:bg-gray-50 transition-all text-sm"
          >
            Batal
          </button>
          <button 
            onClick={onLogout}
            className="flex-1 py-3.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all text-sm shadow-lg shadow-red-200"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
