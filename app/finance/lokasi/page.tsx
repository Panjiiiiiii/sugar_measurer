"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Toast, DeleteModal } from "@/components/ui";
import {
  Plus,
  Export,
  DotsThreeVertical
} from "@phosphor-icons/react";

const initialLocationData = [
  { id: "1", nama: "Malang", accountNumber: "5221068236989225", balance: "Rp 100.000.00" },
  { id: "2", nama: "Blitar", accountNumber: "5221068236989225", balance: "Rp 100.000.00" },
  { id: "3", nama: "Kediri 1", accountNumber: "5221068236989225", balance: "Rp 100.000.00" },
  { id: "4", nama: "Kediri 2", accountNumber: "5221068236989225", balance: "Rp 100.000.00" },
];

export default function LokasiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [locations, setLocations] = useState(initialLocationData);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedLocationName, setSelectedLocationName] = useState<string | null>(null);
  const [activeRowMenu, setActiveRowMenu] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);

  // Close dropdown menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activeRowMenu !== null && tableRef.current && !tableRef.current.contains(event.target as Node)) {
        setActiveRowMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeRowMenu]);

  // Show toast when success parameter is present
  useEffect(() => {
    if (searchParams && searchParams.get("success") === "true") {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleDeleteConfirm = () => {
    if (selectedLocationId) {
      setLocations(prev => prev.filter(loc => loc.id !== selectedLocationId));
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="p-8 space-y-8 bg-[#F9FAFB] min-h-[calc(100vh-72px)]">
      <Toast isVisible={showToast} message="Data Berhasil Disimpan" type="success" />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        message={`Apakah anda yakin ingin menghapus data lokasi ${selectedLocationName || ""} ini?`}
      />

      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Data Lokasi</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/finance/lokasi/add">
            <button 
              suppressHydrationWarning
              className="flex items-center gap-2 px-6 py-2 bg-[#0095FF] text-white rounded-xl text-sm font-bold hover:bg-[#0084FF] transition-all shadow-sm cursor-pointer"
            >
              <Plus size={18} weight="bold" />
              Add
            </button>
          </Link>
        </div>
      </div>

      {/* Data Lokasi Card */}
      <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-lg font-bold text-gray-900">Data Lokasi</h2>
          <button 
            suppressHydrationWarning
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition-all"
          >
            <Export size={18} />
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" ref={tableRef}>
            <thead>
              <tr className="border-y border-gray-100 bg-gray-50/30">
                <th className="px-8 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nama Lokasi</th>
                <th className="px-8 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Account Number</th>
                <th className="px-8 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Balance</th>
                <th className="px-8 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {locations.length > 0 ? (
                locations.map((row, i) => (
                  <tr key={row.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.nama}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.accountNumber}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.balance}</td>
                    <td className="px-8 py-5 flex justify-center">
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveRowMenu(activeRowMenu === i ? null : i);
                          }}
                          suppressHydrationWarning
                          className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100 cursor-pointer flex items-center justify-center"
                        >
                          <DotsThreeVertical size={20} weight="bold" />
                        </button>

                        {activeRowMenu === i && (
                          <div className="absolute right-6 top-10 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-40 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                            <button
                              onClick={() => {
                                router.push(`/finance/lokasi/edit/${row.id}`);
                                setActiveRowMenu(null);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <div className="border-t border-gray-100" />
                            <button
                              onClick={() => {
                                setSelectedLocationId(row.id);
                                setSelectedLocationName(row.nama);
                                setIsDeleteModalOpen(true);
                                setActiveRowMenu(null);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-sm font-medium text-gray-400">
                    Tidak ada data lokasi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="h-4" /> {/* Bottom Padding */}
      </section>
    </div>
  );
}
