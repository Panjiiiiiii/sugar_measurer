"use client";

import React from "react";
import { Funnel, Eye } from "@phosphor-icons/react";
import Pagination from "./Pagination";
import BuktiTransferModal from "./BuktiTransferModal";
import TransferFilterModal from "./TransferFilterModal";

const transferData = Array(20).fill({
  tanggal: "01/01/2026",
  bukti: "tf212493.png",
  nominal: "100.000.000",
});

export default function TransferTable() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-5 transition-all">
      {/* Receipt Modal */}
      <BuktiTransferModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Filter Modal */}
      <TransferFilterModal 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(dates) => {
          console.log("Applying transfer filters:", dates);
          setIsFilterOpen(false);
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Data Riwayat Transfer</h3>
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Funnel size={18} weight="bold" />
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-50 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <th className="pb-4">tanggal</th>
                <th className="pb-4">Bukti Transfer</th>
                <th className="pb-4">Jumlah Nominal</th>
                <th className="pb-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transferData.map((row, index) => (
                <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 text-xs font-medium text-gray-600">{row.tanggal}</td>
                  <td className="py-4 text-xs font-medium text-gray-600">{row.bukti}</td>
                  <td className="py-4 text-xs font-medium text-gray-600">{row.nominal}</td>
                  <td className="py-4 text-right">
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="p-1.5 border border-transparent rounded-lg text-gray-400 hover:border-gray-100 hover:bg-white hover:shadow-sm transition-all focus:outline-none"
                    >
                      <Eye size={18} weight="bold" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination />
    </div>
  );
}
