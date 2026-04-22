"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Funnel, 
  Eye, 
  DotsThreeVertical 
} from "@phosphor-icons/react";
import Link from "next/link";
import FilterModal from "./FilterModal";
import BuktiTransferModal from "./BuktiTransferModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const tableData = [
  {
    tanggal: "01/01/2026",
    nopol: "N 1234 AC",
    nama: "Budi",
    ownership: "Private",
    netto: "1 ton",
    ammount: "1 m",
    status: "Paid",
  },
  {
    tanggal: "02/04/2026",
    nopol: "N 1234 AC",
    nama: "Budi",
    ownership: "Private",
    netto: "1 ton",
    ammount: "1 m",
    status: "Unpaid",
  },
  {
    tanggal: "03/04/2026",
    nopol: "N 1234 AC",
    nama: "Budi",
    ownership: "Private",
    netto: "1 ton",
    ammount: "1 m",
    status: "Paid",
  },
  {
    tanggal: "04/04/2026",
    nopol: "N 1234 AC",
    nama: "Budi",
    ownership: "Private",
    netto: "1 ton",
    ammount: "1 m",
    status: "Unpaid",
  },
  {
    tanggal: "05/04/2026",
    nopol: "N 1234 AC",
    nama: "Budi",
    ownership: "Private",
    netto: "1 ton",
    ammount: "1 m",
    status: "Paid",
  },
];

export default function RiwayatTable() {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isBuktiOpen, setIsBuktiOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuIndex(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-6 transition-all">
      {/* Filter Modal */}
      <FilterModal 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(filters) => {
          console.log("Applying filters:", filters);
          setIsFilterOpen(false);
        }}
      />

      {/* Bukti Transfer Modal */}
      <BuktiTransferModal 
        isOpen={isBuktiOpen}
        onClose={() => setIsBuktiOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          console.log("Item deleted");
          setIsDeleteOpen(false);
        }}
      />

      {/* Table Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">Riwayat Timbangan</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <Funnel size={18} weight="bold" />
            Filter
          </button>
          <Link 
            href="/branch/timbangan"
            className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <Eye size={18} weight="bold" />
            See all
          </Link>
        </div>
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto pb-2 overflow-visible">
        <table className="w-full text-left min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">tanggal</th>
              <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Nopol</th>
              <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Nama</th>
              <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Ownership</th>
              <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Netto</th>
              <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Ammount</th>
              <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Status</th>
              <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tableData.map((row, index) => (
              <tr key={index} className="group">
                <td className="py-4 text-xs font-medium text-gray-600 whitespace-nowrap">{row.tanggal}</td>
                <td className="py-4 text-xs font-medium text-gray-600 whitespace-nowrap">{row.nopol}</td>
                <td className="py-4 text-xs font-medium text-gray-600 whitespace-nowrap">{row.nama}</td>
                <td className="py-4 text-xs font-medium text-gray-600 whitespace-nowrap">{row.ownership}</td>
                <td className="py-4 text-xs font-medium text-gray-600 whitespace-nowrap">{row.netto}</td>
                <td className="py-4 text-xs font-medium text-gray-600 whitespace-nowrap">{row.ammount}</td>
                <td className="py-4 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    row.status === "Paid" 
                      ? "bg-green-50 text-green-600" 
                      : "bg-orange-50 text-orange-600"
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4 text-right whitespace-nowrap relative">
                  <button 
                    onClick={() => setOpenMenuIndex(openMenuIndex === index ? null : index)}
                    className="p-1.5 border border-transparent rounded-lg text-gray-400 hover:border-gray-100 hover:bg-gray-50 transition-all"
                  >
                    <DotsThreeVertical size={18} weight="bold" />
                  </button>

                  {openMenuIndex === index && (
                    <div 
                      ref={menuRef}
                      className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-2xl z-[9999] overflow-hidden flex flex-col"
                    >
                      <button 
                        onClick={() => {
                          setIsBuktiOpen(true);
                          setOpenMenuIndex(null);
                        }}
                        className="w-full px-5 py-3 text-[13px] font-medium text-gray-700 text-left hover:bg-gray-50 transition-all border-b border-gray-100"
                      >
                        Bukti Transfer
                      </button>
                      <button className="w-full px-5 py-3 text-[13px] font-medium text-gray-700 text-left hover:bg-gray-50 transition-colors border-b border-gray-100">
                        Cetak Struk
                      </button>
                      <Link 
                        href="/branch/timbangan/edit/123"
                        className="w-full px-5 py-3 text-[13px] font-medium text-gray-700 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 block"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => {
                          setIsDeleteOpen(true);
                          setOpenMenuIndex(null);
                        }}
                        className="w-full px-5 py-3 text-[13px] font-bold text-red-500 text-left hover:bg-red-50 transition-all focus:outline-none"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
