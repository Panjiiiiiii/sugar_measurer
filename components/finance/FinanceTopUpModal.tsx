"use client";

import React, { useEffect, useState } from "react";
import { UploadSimple } from "@phosphor-icons/react";
import { Button, Modal } from "@/components/ui";

interface FinanceTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { amount: number; buktiTransferFile: File }) => Promise<void> | void;
  isSubmitting?: boolean;
  locationName?: string;
}

const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export function FinanceTopUpModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  locationName,
}: FinanceTopUpModalProps) {
  const [amount, setAmount] = useState("");
  const [buktiTransferFile, setBuktiTransferFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setBuktiTransferFile(null);
      setFileError("");
    }
  }, [isOpen]);

  const isFormValid = Number(amount) > 0 && buktiTransferFile !== null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;

    if (!selectedFile) {
      setBuktiTransferFile(null);
      return;
    }

    if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
      setFileError("Format file harus JPG, PNG, WEBP, atau PDF");
      setBuktiTransferFile(null);
      event.target.value = "";
      return;
    }

    setFileError("");
    setBuktiTransferFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (!isFormValid || !buktiTransferFile) {
      return;
    }

    await onSubmit({
      amount: Number(amount),
      buktiTransferFile,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Top Up Saldo${locationName ? ` ${locationName}` : ""}`}
      size="lg"
    >
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
          Saldo yang ditambahkan akan tercatat sebagai transaction in.
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-600">Saldo Ditambahkan</label>
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Masukkan nominal saldo"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-600">Info Bukti Transfer</label>
          <div
            className={`relative overflow-hidden rounded-3xl border-2 border-dashed transition-all ${
              buktiTransferFile
                ? "border-emerald-400 bg-emerald-50/30"
                : "border-gray-200 bg-gray-50/20 hover:border-blue-400 hover:bg-blue-50/20"
            }`}
          >
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={handleFileChange}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            />
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
              <div
                className={`rounded-2xl p-4 transition-all ${
                  buktiTransferFile
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <UploadSimple size={28} weight="bold" />
              </div>
              <div className="flex flex-col gap-1">
                <p className={`text-sm font-bold ${buktiTransferFile ? "text-emerald-700" : "text-gray-600"}`}>
                  {buktiTransferFile ? buktiTransferFile.name : "Klik untuk upload bukti transfer"}
                </p>
                <p className="text-[11px] font-medium text-gray-400">
                  JPG, PNG, WEBP, atau PDF
                </p>
              </div>
            </div>
          </div>
          {fileError && <p className="text-xs font-medium text-red-500">{fileError}</p>}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3 text-xs text-gray-500">
          Pastikan nominal dan bukti transfer sudah benar sebelum submit.
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-50 pt-6">
        <Button variant="white" type="button" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          type="button"
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? "Menyimpan..." : "Submit"}
        </Button>
      </div>
    </Modal>
  );
}