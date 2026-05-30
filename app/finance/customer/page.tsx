"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DeleteModal, Pagination, Toast } from "@/components/ui";
import {
  Plus,
  CaretDown,
  Export,
  DotsThreeVertical,
} from "@phosphor-icons/react";
import axios from "axios";

interface Customer {
  id: string;
  name: string;
  ownership_type: "farmer" | "private" | "special";
  phone_number: string;
  special_price: number | null;
}

interface PaginationMeta {
  per_page: number;
  number_page: number;
  total_page: number;
  total_data: number;
}

interface OwnerListResponse {
  statusCode: number;
  data: Customer[];
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
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function ownershipLabel(value: string | null | undefined) {
  if (!value) return "";

  if (value === "farmer") return "Petani";
  if (value === "private") return "Pribadi";
  if (value === "special") return "Spesial";

  return value;
}
export default function CustomerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = parsePageParam(searchParams.get("page"));
  const currentOwnershipType =
    searchParams.get("ownership_type") ||
    searchParams.get("type_ownership") ||
    "";

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    per_page: 0,
    number_page: currentPage,
    total_page: 1,
    total_data: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeRowMenu, setActiveRowMenu] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Data Berhasil Disimpan");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

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

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      const storedMessage = sessionStorage.getItem("customer-toast-message");
      if (storedMessage) {
        setToastMessage(storedMessage);
        sessionStorage.removeItem("customer-toast-message");
      } else {
        setToastMessage("Data Berhasil Disimpan");
      }

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

  useEffect(() => {
    let isMounted = true;

    async function fetchCustomers() {
      setIsLoading(true);

      try {
        const response = await axios.get<OwnerListResponse>("/api/owner", {
          params: {
            page: currentPage,
            limit: PAGE_SIZE,
            ownership_type: currentOwnershipType || undefined,
          },
        });

        if (!isMounted) {
          return;
        }

        setCustomers(response.data.data ?? []);
        setPagination(
          response.data.page ?? {
            per_page: response.data.data?.length ?? 0,
            number_page: currentPage,
            total_page: 1,
            total_data: response.data.data?.length ?? 0,
          },
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Error fetching customers:", error);
        setCustomers([]);
        setPagination({
          per_page: 0,
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

    fetchCustomers();

    return () => {
      isMounted = false;
    };
  }, [currentPage, currentOwnershipType]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.total_page) {
      return;
    }

    const nextParams = new URLSearchParams();
    nextParams.set("page", String(page));

    if (currentOwnershipType) {
      nextParams.set("ownership_type", currentOwnershipType);
    }

    router.push(`${pathname}?${nextParams.toString()}`);
  };

  const handleFilterChange = (type: string) => {
    const nextParams = new URLSearchParams();
    nextParams.set("page", "1");

    if (type) {
      nextParams.set("ownership_type", type.toLowerCase());
    }

    router.push(`${pathname}?${nextParams.toString()}`);
    setDropdownOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCustomerId) {
      setIsDeleteModalOpen(false);
      return;
    }

    try {
      const response = await axios.delete<{ statusCode: number; message: string }>(
        `/api/owner/${selectedCustomerId}`,
      );

      setToastMessage(response.data?.message || "Customer berhasil dihapus");
      setShowToast(true);

      setCustomers((prev) => prev.filter((customer) => customer.id !== selectedCustomerId));

      const timer = setTimeout(() => setShowToast(false), 3000);
      void timer;
    } catch (error) {
      console.error("Error deleting customer:", error);
      setToastMessage("Gagal menghapus customer");
      setShowToast(true);
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedCustomerId(null);
      setSelectedCustomerName(null);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#F9FAFB] min-h-[calc(100vh-72px)]">
      <Toast isVisible={showToast} message={toastMessage} type="success" />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        message={`Apakah anda yakin ingin menghapus data customer ${selectedCustomerName || ""} ini?`}
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
              <span>Tipe Kepemilikan {currentOwnershipType ? `: ${ownershipLabel(currentOwnershipType)}` : ""}</span>
              <CaretDown size={14} weight="bold" className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => handleFilterChange("")}
                  className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${!currentOwnershipType ? "text-blue-600 bg-blue-50/30" : "text-gray-700"}`}
                >
                  Semua
                </button>
                <button
                  onClick={() => handleFilterChange("farmer")}
                  className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${currentOwnershipType === "farmer" ? "text-blue-600 bg-blue-50/30" : "text-gray-700"}`}
                >
                  Petani
                </button>
                <button
                  onClick={() => handleFilterChange("private")}
                  className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${currentOwnershipType === "private" ? "text-blue-600 bg-blue-50/30" : "text-gray-700"}`}
                >
                  Pribadi
                </button>
                <button
                  onClick={() => handleFilterChange("special")}
                  className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${currentOwnershipType === "special" ? "text-blue-600 bg-blue-50/30" : "text-gray-700"}`}
                >
                  Khusus
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
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-sm font-medium text-gray-400">
                    Memuat data customer...
                  </td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.name}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">
                      {row.ownership_type === "farmer" ? "Petani" : row.ownership_type === "private" ? "Private" : "Special"}
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.phone_number}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{formatCurrency(row.special_price)}</td>
                    <td className="px-8 py-5 flex justify-center">
                      <div className="relative">
                        <button
                          disabled={row.ownership_type === "special"}
                          onClick={(e) => {
                            if (row.ownership_type === "special") {
                              return;
                            }
                            e.stopPropagation();
                            setActiveRowMenu(activeRowMenu === row.id ? null : row.id);
                          }}
                          suppressHydrationWarning
                          className={`p-2 text-gray-400 rounded-lg transition-colors border border-gray-100 flex items-center justify-center ${
                            row.ownership_type === "special"
                              ? "cursor-not-allowed opacity-50"
                              : "hover:bg-gray-50 cursor-pointer"
                          }`}
                        >
                          <DotsThreeVertical size={20} weight="bold" />
                        </button>

                        {activeRowMenu === row.id && (
                          <div className="absolute right-6 top-10 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-40 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                            <button
                              onClick={() => {
                                router.push(`/finance/customer/edit/${row.id}`);
                                setActiveRowMenu(null);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <div className="border-t border-gray-100" />
                            <button
                              onClick={() => {
                                setSelectedCustomerId(row.id);
                                setSelectedCustomerName(row.name);
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
                    Tidak ada data customer
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
          showingData={customers.length}
          onPageChange={handlePageChange}
        />
      </section>
    </div>
  );
}
