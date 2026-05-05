import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Warning } from "@phosphor-icons/react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  message = "Apakah anda yakin ingin menghapus data riwayat timbangan ini?"
}: DeleteConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Konfirmasi Hapus"
      size="sm"
      footer={
        <>
          <Button variant="white" onClick={onClose}>
            Batal
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Hapus
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
          <Warning size={32} weight="fill" />
        </div>
        <p className="text-gray-600 font-medium leading-relaxed">
          {message}
        </p>
      </div>
    </Modal>
  );
}
