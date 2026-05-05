"use client";

import React from "react";
import { X, DownloadSimple } from "@phosphor-icons/react";
import Image from "next/image";

interface FinanceBuktiTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FinanceBuktiTransferModal({ isOpen, onClose }: FinanceBuktiTransferModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-[420px] rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col">
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-center relative">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Bukti Transfer</h2>
          <button 
            onClick={onClose}
            className="absolute right-8 top-8 p-1 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div className="px-10 pb-8 flex flex-col items-center gap-8">
          <div className="relative w-full aspect-[9/16] rounded-[24px] overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center p-2">
            <Image 
              src="/bukti_transfer.png"
              alt="Bukti Transfer"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Download Button */}
          <button 
            onClick={() => console.log("Downloading...")}
            className="w-full flex items-center justify-center gap-2.5 py-4.5 bg-[#009253] text-white rounded-2xl font-bold hover:bg-[#007a45] transition-all shadow-lg shadow-green-100 text-sm tracking-tight"
          >
            <DownloadSimple size={20} weight="bold" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
