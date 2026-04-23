"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Funnel, 
  Plus, 
  DotsThreeVertical 
} from "@phosphor-icons/react";
import Pagination from "./Pagination";
import TrukFilterModal from "./TrukFilterModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const tableData = Array(20).fill({
  nopol: "N 1234 AC",
  namaTruk: "Scania Mantap",
  namaPemilik: "Budi",
  type: "Engkel",
  ownership: "Private",
  accountNumber: "5221068236989 225",
});

export default function TrukTable() {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-5 transition-all">
      {/* Filter Modal */}
      <TrukFilterModal 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(filters) => {
          console.log("Applying truck filters:", filters);
          setIsFilterOpen(false);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          console.log("Truck data deleted");
          setIsDeleteOpen(false);
        }}
        message="Apakah anda yakin ingin menghapus data truck ini?"
      />

      {/* Table Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Data Truk</h3>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <Funnel size={18} weight="bold" />
            Filter
          </button>
          <Link 
            href="/branch/truk/add"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-sm font-semibold text-white hover:bg-blue-700 transition-all"
          >
            <Plus size={18} weight="bold" />
            Add
          </Link>
        </div>
      </div>

      {/* Table grid */}
      <div className="overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Nopol</th>
                <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Nama Truk</th>
                <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Nama Pemilik</th>
                <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Ownership</th>
                <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Account Number</th>
                <th className="pb-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tableData.map((row, index) => (
                <tr key={index} className="group">
                  <td className="py-4 text-xs font-medium text-gray-600">{row.nopol}</td>
                  <td className="py-4 text-xs font-medium text-gray-600">{row.namaTruk}</td>
                  <td className="py-4 text-xs font-medium text-gray-600">{row.namaPemilik}</td>
                  <td className="py-4 text-xs font-medium text-gray-600">
                    {index % 3 === 2 ? "Double" : "Engkel"}
                  </td>
                  <td className="py-4 text-xs font-medium text-gray-600">{row.ownership}</td>
                  <td className="py-4 text-xs font-medium text-gray-600">{row.accountNumber}</td>
                  <td className="py-4 text-right relative">
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
                        <Link 
                          href="/branch/truk/edit/123"
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

      {/* Pagination */}
      <Pagination />
    </div>
  );
}
