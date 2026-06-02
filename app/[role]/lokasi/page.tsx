"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Toast, DeleteModal, Card, ActionMenu } from "@/components/ui";
import { PageHeader } from "@/components/dashboard/PageHeader";
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

export default function LokasiRolePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleRaw = params.role as string;
  const role = (!roleRaw || roleRaw === "undefined") ? "branch" : roleRaw;

  const [locations, setLocations] = useState(initialLocationData);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedLocationName, setSelectedLocationName] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

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

  const handleExport = () => {
    if (typeof window === "undefined") return;
    import("xlsx").then((XLSX) => {
      const worksheet = XLSX.utils.json_to_sheet(
        locations.map((row) => ({
          "Nama Lokasi": row.nama,
          "Account Number": row.accountNumber,
          Balance: row.balance,
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Locations");
      XLSX.writeFile(workbook, "Data_Lokasi.xlsx");
    });
  };

  return (
    <div className="p-8 space-y-8 bg-[#F9FAFB] min-h-[calc(100vh-72px)] w-full max-w-full">
      <Toast isVisible={showToast} message="Data Berhasil Disimpan" type="success" />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        message={`Apakah anda yakin ingin menghapus data lokasi ${selectedLocationName || ""} ini?`}
      />

      {/* Page Header */}
      <PageHeader
        title="Data Lokasi"
        primaryAction={{
          label: "Add",
          onClick: () => router.push(`/${role}/lokasi/add`),
        }}
      />

      {/* Data Lokasi Card */}
      <Card
        title="Data Lokasi"
        noPadding
        headerAction={
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer transition-all"
          >
            <Export size={16} weight="bold" />
            <span>Export</span>
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400">
                <th className="px-8 py-5 text-left font-semibold text-gray-400">Nama Lokasi</th>
                <th className="px-8 py-5 text-left font-semibold text-gray-400">Account Number</th>
                <th className="px-8 py-5 text-left font-semibold text-gray-400">Balance</th>
                <th className="px-8 py-5 text-right font-semibold text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {locations.length > 0 ? (
                locations.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4 text-xs font-semibold text-[#111827] text-left">{row.nama}</td>
                    <td className="px-8 py-4 text-xs font-medium text-gray-500 text-left">{row.accountNumber}</td>
                    <td className="px-8 py-4 text-xs font-medium text-gray-500 text-left">{row.balance}</td>
                    <td className="px-8 py-4 text-right">
                      <ActionMenu
                        trigger={
                          <button className="p-2 text-gray-400 hover:text-gray-900 border border-gray-100 rounded-xl hover:bg-white hover:shadow-sm transition-all inline-flex items-center justify-center cursor-pointer">
                            <DotsThreeVertical size={18} weight="bold" />
                          </button>
                        }
                        items={[
                          {
                            label: "Edit",
                            onClick: () => router.push(`/${role}/lokasi/edit/${row.id}`),
                          },
                          {
                            label: "Hapus",
                            variant: "danger",
                            onClick: () => {
                              setSelectedLocationId(row.id);
                              setSelectedLocationName(row.nama);
                              setIsDeleteModalOpen(true);
                            },
                          },
                        ]}
                      />
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
      </Card>
    </div>
  );
}
