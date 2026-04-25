"use client";

import React from "react";
import { CaretRight, PencilSimpleLine } from "@phosphor-icons/react";
import EditHargaModal from "./EditHargaModal";
import Link from "next/link";

interface LocationCardProps {
  name: string;
  totalKas: string;
  transaksi: number;
  tonase: string;
  hargaTebu: string;
  status?: "Normal" | "Warning";
}

export default function LocationCard({
  name,
  totalKas,
  transaksi,
  tonase,
  hargaTebu,
  status = "Normal"
}: LocationCardProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <>
      <EditHargaModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        locationName={name}
        currentPrice={hargaTebu}
      />
      
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
        {/* Header */}
        <div className="p-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{name}</h2>
          <span className="px-3 py-1 bg-green-50 text-[#009253] text-xs font-bold rounded-lg border border-green-100">
            {status}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="px-8 pb-8 grid grid-cols-2 gap-y-6">
          {/* Row 1 */}
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-gray-400">Total Kas</p>
            <p className="text-xl font-bold text-gray-900">{totalKas}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-gray-400">Transaksi</p>
            <p className="text-xl font-bold text-gray-900">{transaksi} Transaksi</p>
          </div>

          {/* Row 2 */}
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-gray-400">Tonase</p>
            <p className="text-xl font-bold text-gray-900">{tonase} ton</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-gray-400">Harga Tebu</p>
            <div className="flex items-center gap-3">
              <p className="text-xl font-bold text-gray-900">{hargaTebu}/kg</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 transition-colors"
              >
                <PencilSimpleLine size={18} weight="bold" />
                <span className="text-xs font-bold">Edit Harga</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Link 
          href={`/finance/transfer?branch=${encodeURIComponent(name)}`}
          className="mt-auto w-full px-8 py-5 bg-gray-50/50 flex items-center justify-between group hover:bg-gray-50 transition-colors border-t border-gray-50"
        >
          <span className="text-sm font-bold text-gray-900">Lihat detail transaksi</span>
          <CaretRight size={18} weight="bold" className="text-gray-400 group-hover:text-gray-900 transition-colors" />
        </Link>
      </div>
    </>
  );
}
