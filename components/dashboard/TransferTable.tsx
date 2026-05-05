"use client";

import React from "react";
import { Funnel, Eye } from "@phosphor-icons/react";
import BuktiTransferModal from "./BuktiTransferModal";
import TransferFilterModal from "./TransferFilterModal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";

const transferData = Array(20).fill({
  tanggal: "01/01/2026",
  bukti: "tf212493.png",
  nominal: "100.000.000",
});

export default function TransferTable() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  return (
    <Card 
      title="Data Riwayat Transfer" 
      noPadding
      headerAction={
        <Button 
          variant="white" 
          size="md" 
          onClick={() => setIsFilterOpen(true)}
          icon={<Funnel size={18} weight="bold" />}
        >
          Filter
        </Button>
      }
    >
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

      {/* Table */}
      <div className="overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-50 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <th className="px-8 py-4">tanggal</th>
                <th className="px-4 py-4">Bukti Transfer</th>
                <th className="px-4 py-4">Jumlah Nominal</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transferData.map((row, index) => (
                <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-4 text-xs font-medium text-gray-600">{row.tanggal}</td>
                  <td className="px-4 py-4 text-xs font-medium text-gray-600">{row.bukti}</td>
                  <td className="px-4 py-4 text-xs font-medium text-gray-600">{row.nominal}</td>
                  <td className="px-8 py-4 text-right">
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
    </Card>
  );
}
