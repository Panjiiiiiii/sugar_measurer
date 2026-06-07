"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Toast, DeleteModal, Card, ActionMenu } from "@/components/ui";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Export, DotsThreeVertical } from "@phosphor-icons/react";

interface Location {
  id: string;
  name: string;
  account_number: string;
  account_balance: string;
}

interface PaginationMeta {
  number_page: number;
  total_page: number;
  total_data: number;
}

export default function LokasiRolePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleRaw = params.role as string;
  const role = !roleRaw || roleRaw === "undefined" ? "branch" : roleRaw;

  const [locations, setLocations] = useState<Location[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    number_page: 1,
    total_page: 1,
    total_data: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [selectedLocationName, setSelectedLocationName] = useState<
    string | null
  >(null);
  const [showToast, setShowToast] = useState(false);

  const fetchLocations = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/location?page=${page}&limit=10`);
      if (!res.ok) throw new Error("Gagal memuat data lokasi");
      const json = await res.json();
      setLocations(json.data ?? []);
      setPagination(json.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations(currentPage);
  }, [currentPage, fetchLocations]);

  // Show toast when success parameter is present
  useEffect(() => {
    if (searchParams?.get("success") === "true") {
      setShowToast(true);
      fetchLocations(currentPage); // refresh data setelah tambah/edit
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Sudah benar — tidak perlu diubah
  const handleDeleteConfirm = async () => {
    if (selectedLocationId) {
      try {
        const res = await fetch(`/api/location/${selectedLocationId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Gagal menghapus data");
        await fetchLocations(currentPage);
        // Tampilkan toast sukses setelah hapus
        setShowToast(true);
        const timer = setTimeout(() => setShowToast(false), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menghapus");
      }
    }
    setIsDeleteModalOpen(false);
    setSelectedLocationId(null);
    setSelectedLocationName(null);
  };

  const handleExport = () => {
    if (typeof window === "undefined") return;
    import("xlsx").then((XLSX) => {
      const worksheet = XLSX.utils.json_to_sheet(
        locations.map((row) => ({
          "Nama Lokasi": row.name,
          "Account Number": row.account_number,
          Balance: row.account_balance,
        })),
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Locations");
      XLSX.writeFile(workbook, "Data_Lokasi.xlsx");
    });
  };

  return (
    <div className="p-8 space-y-8 bg-[#F9FAFB] min-h-[calc(100vh-72px)] w-full max-w-full">
      <Toast
        isVisible={showToast}
        message="Data Berhasil Disimpan"
        type="success"
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        message={`Apakah anda yakin ingin menghapus data lokasi ${selectedLocationName || ""} ini?`}
      />

      <PageHeader
        title="Data Lokasi"
        primaryAction={{
          label: "Add",
          onClick: () => router.push(`/${role}/lokasi/add`),
        }}
      />

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
                <th className="px-8 py-5 text-left font-semibold text-gray-400">
                  Nama Lokasi
                </th>
                <th className="px-8 py-5 text-left font-semibold text-gray-400">
                  Account Number
                </th>
                <th className="px-8 py-5 text-left font-semibold text-gray-400">
                  Balance
                </th>
                <th className="px-8 py-5 text-right font-semibold text-gray-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-10 text-center text-sm font-medium text-gray-400"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-10 text-center text-sm font-medium text-red-400"
                  >
                    {error}
                  </td>
                </tr>
              ) : locations.length > 0 ? (
                locations.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-8 py-4 text-xs font-semibold text-[#111827] text-left">
                      {row.name}
                    </td>
                    <td className="px-8 py-4 text-xs font-medium text-gray-500 text-left">
                      {row.account_number}
                    </td>
                    <td className="px-8 py-4 text-xs font-medium text-gray-500 text-left">
                      {row.account_balance}
                    </td>
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
                            onClick: () =>
                              router.push(`/${role}/lokasi/edit/${row.id}`),
                          },
                          {
                            label: "Hapus",
                            variant: "danger",
                            onClick: () => {
                              setSelectedLocationId(row.id);
                              setSelectedLocationName(row.name);
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
                  <td
                    colSpan={4}
                    className="px-8 py-10 text-center text-sm font-medium text-gray-400"
                  >
                    Tidak ada data lokasi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && !error && pagination.total_page > 1 && (
          <div className="flex items-center justify-between px-8 py-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Halaman {pagination.number_page} dari {pagination.total_page} (
              {pagination.total_data} data)
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-all"
              >
                Sebelumnya
              </button>
              <button
                disabled={currentPage >= pagination.total_page}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-all"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
