"use client";

import React from "react";
import { Modal, Badge } from "@/components/ui";

interface BuktiTransaksiModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: any;
}

export function BuktiTransaksiModal({ isOpen, onClose, data }: BuktiTransaksiModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Bukti Transaksi"
      centerTitle
      size="xl"
    >
      <div className="w-full bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1200px]">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/30">
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap text-center">tanggal</th>
                <th className="px-4 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap text-center">Masuk</th>
                <th className="px-4 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap text-center">Keluar</th>
                <th className="px-4 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap text-center">Nopol</th>
                <th className="px-4 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap text-center">Supir</th>
                <th className="px-4 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap text-center">Ownership</th>
                <th className="px-4 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap text-center">Customer</th>
                <th className="px-4 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap text-center">Bruto</th>
                <th className="px-4 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap text-center">Tarre</th>
                <th className="px-4 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap text-center">Netto</th>
                <th className="px-4 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap text-center">Amount</th>
                <th className="px-4 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap text-center">Payment Method</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-6 text-xs font-medium text-gray-600 whitespace-nowrap text-center">01/01/2026</td>
                <td className="px-4 py-6 text-xs font-medium text-gray-600 whitespace-nowrap text-center">15:00</td>
                <td className="px-4 py-6 text-xs font-medium text-gray-600 whitespace-nowrap text-center">16:00</td>
                <td className="px-4 py-6 text-xs font-medium text-gray-600 whitespace-nowrap text-center">N 1234 AC</td>
                <td className="px-4 py-6 text-xs font-medium text-gray-600 whitespace-nowrap text-center">Budi</td>
                <td className="px-4 py-6 text-xs font-medium text-gray-600 whitespace-nowrap text-center">Petani</td>
                <td className="px-4 py-6 text-xs font-medium text-gray-600 whitespace-nowrap text-center">Abah</td>
                <td className="px-4 py-6 text-xs font-medium text-gray-600 whitespace-nowrap text-center">100 kg</td>
                <td className="px-4 py-6 text-xs font-medium text-gray-600 whitespace-nowrap text-center">25 kg</td>
                <td className="px-4 py-6 text-xs font-medium text-gray-600 whitespace-nowrap text-center">10 kw</td>
                <td className="px-4 py-6 text-xs font-medium text-gray-600 whitespace-nowrap text-center">Rp 500.000</td>
                <td className="px-4 py-6 text-xs font-medium text-gray-600 whitespace-nowrap text-center">Cash</td>
                <td className="px-6 py-6 text-center">
                  <Badge variant="success" className="rounded-lg px-3 py-1 text-[10px] font-bold">
                    Paid
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}
