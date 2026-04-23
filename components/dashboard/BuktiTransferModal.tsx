"use client";

import React from "react";
import { X } from "@phosphor-icons/react";
import Image from "next/image";

interface BuktiTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BuktiTransferModal({ isOpen, onClose }: BuktiTransferModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-[400px] rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div className="w-6" /> {/* Spacer for centering */}
          <h2 className="text-xl font-bold text-gray-900">Bukti Transfer</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div className="px-10 pb-10 flex justify-center">
          <div className="relative w-full aspect-[9/18.5] rounded-[24px] overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
            <Image 
              src="/bukti_transfer.png"
              alt="Bukti Transfer"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
