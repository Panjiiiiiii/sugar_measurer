"use client";

import React, { useMemo, useState } from "react";
import { Modal } from "@/components/ui";
import axios from "@/lib/axios";
import {
  formatReceipt,
  PAPER_WIDTH_MM,
  toReceiptFormatData,
  type ReceiptData,
} from "@/lib/receipt";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReceiptData;
}

export function ReceiptModal({ isOpen, onClose, data }: ReceiptModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  const receiptText = useMemo(
    () => formatReceipt(toReceiptFormatData(data)),
    [data],
  );

  async function handlePrint() {
    setIsPrinting(true);
    setPrintError(null);

    try {
      await axios.post("/api/print/receipt", { text: receiptText });
      onClose();
    } catch (error: unknown) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? String(error.response.data.message)
          : "Gagal mencetak struk. Periksa koneksi printer.";
      setPrintError(message);
    } finally {
      setIsPrinting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Preview Struk"
      size="sm"
      centerTitle
    >
      <div className="bg-white flex flex-col items-center">
        <pre
          className="w-full font-mono text-[10px] leading-4 text-gray-800 whitespace-pre overflow-x-auto bg-gray-50 border border-gray-100 rounded-xl p-4"
          style={{ maxWidth: `${PAPER_WIDTH_MM}mm` }}
        >
          {receiptText}
        </pre>
      </div>

      {printError && (
        <p className="mt-3 text-xs text-red-500 text-center">{printError}</p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <button
          onClick={handlePrint}
          disabled={isPrinting}
          className="w-full py-4 bg-[#009262] text-white rounded-2xl font-bold hover:bg-[#007a52] transition-all shadow-lg shadow-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPrinting ? "Mencetak..." : "Cetak Struk"}
        </button>
      </div>
    </Modal>
  );
}

export type { ReceiptData };
