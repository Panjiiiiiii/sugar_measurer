"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DeleteModal, Pagination, Toast } from "@/components/ui";
import { DotsThreeVertical, Export, Plus } from "@phosphor-icons/react";

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

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
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
  const [activeRowMenu, setActiveRowMenu] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Data Berhasil Disimpan");
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        activeRowMenu !== null &&
        tableRef.current &&
        !tableRef.current.contains(event.target as Node)
      ) {
        setActiveRowMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeRowMenu]);

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
          {/* <button
            suppressHydrationWarning
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition-all"
          >
            <Export size={18} />
            Export
          </button> */}
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
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-sm font-medium text-gray-400">
                    Memuat data lokasi...
                  </td>
                </tr>
              ) : locations.length > 0 ? (
                locations.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.name}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.account_number || "-"}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{formatCurrency(row.account_balance)}</td>
                    <td className="px-8 py-5 flex justify-center">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveRowMenu(activeRowMenu === row.id ? null : row.id);
                          }}
                          suppressHydrationWarning
                          className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100 cursor-pointer flex items-center justify-center"
                        >
                          <DotsThreeVertical size={20} weight="bold" />
                        </button>

                        {activeRowMenu === row.id && (
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
                                setSelectedLocationName(row.name);
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

        <Pagination
          currentPage={pagination.number_page}
          totalPages={pagination.total_page}
          totalData={pagination.total_data}
          showingData={locations.length}
          onPageChange={handlePageChange}
        />
      </section>
    </div>
  );
}