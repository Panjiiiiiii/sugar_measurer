"use client";

import React from "react";
import { Modal, Badge } from "@/components/ui";

interface TransactionDetail {
  id: string;
  transaction_date: string;
  loading_in: string;
  loading_out: string | null;
  bruto: number;
  tare: number;
  netto: number | null;
  current_price: number;
  total_price: number | null;
  payment_method: string;
  status: string;
  driver_name: string | null;
  truck_name: string;
  license_plate: string;
  owner_name: string | null;
  ownership_type: string | null;
  location_name: string;
  sugar_price: number;
}

interface BuktiTransaksiModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  data?: TransactionDetail | null;
}

function formatRupiah(value: number | null | undefined) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDateOnly(value: string) {
  const normalized = value.includes("T") ? value.slice(0, 10) : value;
  const date = new Date(`${normalized}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return normalized;
  }

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatPaymentMethod(value: string) {
  if (value === "cash") return "Cash";
  if (value === "transfer") return "Transfer";
  if (value === "private") return "Private";
  return value;
}

function formatStatus(value: string) {
  if (value === "paid") return "Paid";
  if (value === "queue") return "Queue";
  if (value === "unpaid") return "Unpaid";
  return value;
}

export function BuktiTransaksiModal({ isOpen, onClose, isLoading, data }: BuktiTransaksiModalProps) {
  const rows = data
    ? [
        { label: "Tanggal", value: formatDateOnly(data.transaction_date) },
        { label: "Masuk", value: data.loading_in },
        { label: "Keluar", value: data.loading_out ?? "-" },
        { label: "Nopol", value: data.license_plate },
        { label: "Supir", value: data.driver_name ?? "-" },
        { label: "Ownership", value: data.ownership_type ?? "-" },
        { label: "Customer", value: data.owner_name ?? "-" },
        { label: "Bruto", value: `${data.bruto} kg` },
        { label: "Tarra", value: `${data.tare} kg` },
        { label: "Netto", value: data.netto !== null ? `${data.netto} kg` : "-" },
        { label: "Amount", value: formatRupiah(data.total_price ?? data.current_price) },
        { label: "Payment Method", value: formatPaymentMethod(data.payment_method) },
        { label: "Status", value: formatStatus(data.status) },
      ]
    : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bukti Transaksi"
      centerTitle
      size="xl"
    >
      {isLoading ? (
        <div className="w-full py-16 flex items-center justify-center text-sm font-medium text-gray-400">
          Memuat detail transaksi...
        </div>
      ) : !data ? (
        <div className="w-full py-16 flex items-center justify-center text-sm font-medium text-gray-400">
          Detail transaksi tidak tersedia
        </div>
      ) : (
        <div className="w-full bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-300">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/30">
                  {rows.map((row) => (
                    <th
                      key={row.label}
                      className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap text-center"
                    >
                      {row.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr className="hover:bg-gray-50/50 transition-colors">
                  {rows.map((row) => (
                    <td
                      key={row.label}
                      className="px-6 py-6 text-xs font-medium text-gray-600 whitespace-nowrap text-center"
                    >
                      {row.value}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && data && (
        <div className="mt-4 flex justify-end">
          <Badge variant="success" className="rounded-lg px-3 py-1 text-[10px] font-bold">
            {formatStatus(data.status)}
          </Badge>
        </div>
      )}
    </Modal>
  );
}
