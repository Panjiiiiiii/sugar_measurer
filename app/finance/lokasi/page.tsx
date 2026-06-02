"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DeleteModal, Toast, Card, ActionMenu, Pagination } from "@/components/ui";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DotsThreeVertical, Export } from "@phosphor-icons/react";

interface LocationItem {
  id: string;
  name: string;
  account_number: string | null;
  account_balance: number | null;
  sugar_price: number;
}

interface PaginationMeta {
  number_page: number;
  total_page: number;
  total_data: number;
}

interface LocationListResponse {
  statusCode: number;
  data: LocationItem[];
  page: PaginationMeta;
}

const PAGE_SIZE = 10;

function parsePageParam(value: string | null) {
  const parsed = Number.parseInt(value ?? "1", 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}

export default function LokasiPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = parsePageParam(searchParams.get("page"));

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    number_page: currentPage,
    total_page: 1,
    total_data: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedLocationName, setSelectedLocationName] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Data Berhasil Disimpan");

  useEffect(() => {
    let isMounted = true;

    async function fetchLocations() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/location?page=${currentPage}&limit=${PAGE_SIZE}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch locations");
        }

        const result = (await response.json()) as LocationListResponse;

        if (!isMounted) return;

        setLocations(result.data ?? []);
        setPagination(
          result.page ?? {
            number_page: currentPage,
            total_page: 1,
            total_data: result.data?.length ?? 0,
          },
        );
      } catch (error) {
        if (!isMounted) return;
        console.error("Error fetching locations:", error);
        setLocations([]);
        setPagination({
          number_page: currentPage,
          total_page: 1,
          total_data: 0,
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchLocations();
    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  useEffect(() => {
    const sessionKey = "lokasi_navigated";
    const isClientNavigation = sessionStorage.getItem(sessionKey) === "true";

    if (!isClientNavigation && searchParams.toString()) {
      router.replace(pathname);
      return;
    }

    if (searchParams.get("success") === "true") {
      setToastMessage("Data Berhasil Disimpan");
      setShowToast(true);

      const timer = setTimeout(() => setShowToast(false), 3000);
      const cleanParams = new URLSearchParams(searchParams.toString());
      cleanParams.delete("success");

      const nextUrl = cleanParams.toString()
        ? `${pathname}?${cleanParams.toString()}`
        : pathname;

      router.replace(nextUrl);
      return () => clearTimeout(timer);
    }
  }, [pathname, router, searchParams]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.total_page) {
      return;
    }
    sessionStorage.setItem("lokasi_navigated", "true");
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("page", String(page));
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  const handleDeleteConfirm = async () => {
    if (selectedLocationId) {
      try {
        const response = await fetch(`/api/location/${selectedLocationId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete location");
        }

        setLocations((prev) => prev.filter((loc) => loc.id !== selectedLocationId));
        setToastMessage("Data Lokasi Berhasil Dihapus");
        setShowToast(true);

        const timer = setTimeout(() => setShowToast(false), 3000);
        void timer;
      } catch (error) {
        console.error("Error deleting location:", error);
      }
    }
    setIsDeleteModalOpen(false);
  };

  const handleExport = () => {
    if (typeof window === "undefined") return;
    import("xlsx").then((XLSX) => {
      const worksheet = XLSX.utils.json_to_sheet(
        locations.map((row) => ({
          "Nama Lokasi": row.name,
          "Account Number": row.account_number ?? "-",
          Balance: row.account_balance !== null && row.account_balance !== undefined
            ? `Rp ${new Intl.NumberFormat("id-ID").format(row.account_balance)}`
            : "Rp 0",
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Locations");
      XLSX.writeFile(workbook, "Data_Lokasi.xlsx");
    });
  };

  return (
    <div className="p-8 space-y-8 bg-[#F9FAFB] min-h-[calc(100vh-72px)]">
      <Toast isVisible={showToast} message={toastMessage} type="success" />
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
          onClick: () => router.push("/finance/lokasi/add"),
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
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-8 py-5">
                        <div className="h-4 bg-gray-100 rounded-lg w-24"></div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="h-4 bg-gray-100 rounded-lg w-32"></div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="h-4 bg-gray-100 rounded-lg w-24"></div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="h-9 bg-gray-50 rounded-xl w-9 ml-auto"></div>
                      </td>
                    </tr>
                  ))
              ) : locations.length > 0 ? (
                locations.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4 text-xs font-semibold text-[#111827] text-left">{row.name}</td>
                    <td className="px-8 py-4 text-xs font-medium text-gray-500 text-left">{row.account_number || "-"}</td>
                    <td className="px-8 py-4 text-xs font-medium text-gray-500 text-left">
                      {row.account_balance !== null && row.account_balance !== undefined
                        ? `Rp ${new Intl.NumberFormat("id-ID").format(row.account_balance)}`
                        : "Rp 0"}
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
                            onClick: () => router.push(`/finance/lokasi/edit/${row.id}`),
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
                  <td colSpan={4} className="px-8 py-10 text-center text-sm font-medium text-gray-400">
                    Tidak ada data lokasi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      {!isLoading && locations.length > 0 && (
        <Pagination
          currentPage={pagination.number_page}
          totalPages={pagination.total_page}
          totalData={pagination.total_data}
          showingData={locations.length}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}