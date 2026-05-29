"use client";

import React from "react";
import { Modal } from "@/components/ui";

interface BuktiTransferReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc?: string | null;
}

function formatImageName(imageSrc?: string | null) {
  if (!imageSrc) {
    return "";
  }

  return imageSrc.split("/").pop() || "";
}

function normalizeImageSrc(imageSrc?: string | null) {
  if (!imageSrc) {
    return null;
  }

  const fileName = imageSrc.split("/").pop()?.trim();

  if (!fileName) {
    return null;
  }

  return `/finance/transfer/${encodeURIComponent(fileName)}`;
}

export function BuktiTransferReceiptModal({ isOpen, onClose, imageSrc }: BuktiTransferReceiptModalProps) {
  const fileName = formatImageName(imageSrc);
  const normalizedSrc = normalizeImageSrc(imageSrc);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Bukti Transaksi"
      centerTitle
      size="md"
    >
      <div className="flex justify-center items-center bg-gray-50 rounded-3xl p-6 overflow-hidden">
        <div className="w-full max-w-90 bg-white rounded-4xl overflow-hidden shadow-2xl border border-gray-100">

          {normalizedSrc ? (
            <img
              src={normalizedSrc}
              alt="Bukti transfer"
              className="w-full h-auto object-contain bg-white"
            />
          ) : (
            <div className="px-6 py-16 text-center text-sm font-medium text-gray-400">
              Bukti transfer tidak tersedia
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
