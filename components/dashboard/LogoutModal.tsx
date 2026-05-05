"use client";

import React from "react";
import { SignOut } from "@phosphor-icons/react";

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
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-[4px] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-[400px] rounded-[32px] shadow-2xl animate-in fade-in zoom-in-95 duration-300 p-10 flex flex-col items-center gap-6 text-center">
        {/* Warning Icon Wrapper */}
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-2">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <SignOut size={32} weight="bold" />
            </div>
        </div>

        <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Konfirmasi Log Out
            </h2>
            <p className="text-sm font-medium text-gray-500 leading-relaxed px-4">
              Apakah anda yakin ingin keluar dari akun anda saat ini?
            </p>
        </div>

        <div className="flex flex-col gap-3 w-full mt-2">
          <button 
            onClick={onLogout}
            className="w-full py-4 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all text-sm shadow-lg shadow-red-200"
          >
            Ya, Log Out
          </button>
          <button 
            onClick={onClose}
            className="w-full py-4 rounded-2xl border border-gray-100 bg-white text-gray-600 font-bold hover:bg-gray-50 transition-all text-sm"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
