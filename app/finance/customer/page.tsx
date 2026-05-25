"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Toast, DeleteModal } from "@/components/ui";
import {
  Plus,
  CaretDown,
  Export,
  DotsThreeVertical
} from "@phosphor-icons/react";

const customerData = [
  { nama: "Budi", type: "Petani", phone: "087459687412", price: "Rp 8.000 /kg" },
  { nama: "Dadang", type: "Private", phone: "087459687412", price: "Rp 8.000 /kg" },
  { nama: "Julpan", type: "Petani", phone: "087459687412", price: "Rp 8.000 /kg" },
  { nama: "Jaedin", type: "Private", phone: "087459687412", price: "Rp 8.000 /kg" },
];

export default function CustomerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState(customerData);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("All");
  const [activeRowMenu, setActiveRowMenu] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
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

  const filteredCustomerData = filterType === "All"
    ? customers
    : customers.filter(customer => customer.type === filterType);

  const handleDeleteConfirm = () => {
    if (selectedCustomerName) {
      setCustomers(prev => prev.filter(c => c.nama !== selectedCustomerName));
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
        message="Apakah anda yakin ingin menghapus data user ini?"
      />
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Data Customer</h1>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Filter Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              suppressHydrationWarning
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-sm"
            >
              <span>Type Owner{filterType !== "All" ? `: ${filterType}` : ""}</span>
              <CaretDown size={14} weight="bold" className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => {
                    setFilterType("All");
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${filterType === "All" ? "text-blue-600 bg-blue-50/30" : "text-gray-700"}`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setFilterType("Petani");
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${filterType === "Petani" ? "text-blue-600 bg-blue-50/30" : "text-gray-700"}`}
                >
                  Petani
                </button>
                <button
                  onClick={() => {
                    setFilterType("Private");
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${filterType === "Private" ? "text-blue-600 bg-blue-50/30" : "text-gray-700"}`}
                >
                  Private
                </button>
              </div>
            )}
          </div>

          <Link href="/finance/customer/add">
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

      {/* Data Customer Card */}
      <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-lg font-bold text-gray-900">Data Customer</h2>
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
                <th className="px-8 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nama</th>
                <th className="px-8 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type Owner</th>
                <th className="px-8 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone Number</th>
                <th className="px-8 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Special Price</th>
                <th className="px-8 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomerData.length > 0 ? (
                filteredCustomerData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.nama}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.type}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.phone}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.price}</td>
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
                                router.push(`/finance/customer/edit/${row.nama.toLowerCase()}`);
                                setActiveRowMenu(null);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <div className="border-t border-gray-100" />
                            <button
                              onClick={() => {
                                setSelectedCustomerName(row.nama);
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
                  <td colSpan={5} className="px-8 py-10 text-center text-sm font-medium text-gray-400">
                    Tidak ada data customer untuk filter ini
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
