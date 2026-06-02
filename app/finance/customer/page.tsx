"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DeleteModal, Toast, Card, ActionMenu, Pagination, Select } from "@/components/ui";
import { PageHeader } from "@/components/dashboard/PageHeader";
import {
  Plus,
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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Data Berhasil Disimpan");

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

        if (!isMounted) return;

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
        if (!isMounted) return;
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
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("page", String(page));
    router.push(`${pathname}?${nextParams.toString()}`);
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
      setTimeout(() => setShowToast(false), 3000);
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

  const handleExport = () => {
    if (typeof window === "undefined") return;
    import("xlsx").then((XLSX) => {
      const worksheet = XLSX.utils.json_to_sheet(
        customers.map((customer) => ({
          Nama: customer.name,
          "Type Owner": customer.ownership_type === "farmer" ? "Petani" : customer.ownership_type === "private" ? "Private" : "Special",
          "Phone Number": customer.phone_number,
          "Special Price": `Rp ${new Intl.NumberFormat("id-ID").format(customer.special_price ?? 0)} /kg`,
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
      XLSX.writeFile(workbook, "Data_Customer.xlsx");
    });
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
      <PageHeader
        title="Data Customer"
        extraActions={
          <div className="w-36">
            <Select 
              variant="compact"
              value={currentOwnershipType}
              onChange={(e) => {
                const nextParams = new URLSearchParams(searchParams.toString());
                if (e.target.value) {
                  nextParams.set("ownership_type", e.target.value);
                } else {
                  nextParams.delete("ownership_type");
                }
                nextParams.set("page", "1");
                router.push(`${pathname}?${nextParams.toString()}`);
              }}
              options={[
                { value: "", label: "Type Owner" },
                { value: "farmer", label: "Petani" },
                { value: "private", label: "Private" },
                { value: "special", label: "Khusus" }
              ]} 
            />
          </div>
        }
        primaryAction={{
          label: "Add",
          onClick: () => router.push("/finance/customer/add"),
        }}
      />

      {/* Data Customer Card */}
      <Card 
        title="Data Customer" 
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
                <th className="px-8 py-5 text-left font-semibold text-gray-400">Nama</th>
                <th className="px-8 py-5 text-left font-semibold text-gray-400">Type Owner</th>
                <th className="px-8 py-5 text-left font-semibold text-gray-400">Phone Number</th>
                <th className="px-8 py-5 text-left font-semibold text-gray-400">Special Price</th>
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
                        <div className="h-4 bg-gray-100 rounded-lg w-20"></div>
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
              ) : customers.length > 0 ? (
                customers.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4 text-xs font-semibold text-[#111827] text-left">{row.name}</td>
                    <td className="px-8 py-4 text-xs font-medium text-gray-500 text-left capitalize">
                      {row.ownership_type === "farmer" ? "Petani" : row.ownership_type === "private" ? "Private" : "Special"}
                    </td>
                    <td className="px-8 py-4 text-xs font-medium text-gray-500 text-left">{row.phone_number}</td>
                    <td className="px-8 py-4 text-xs font-medium text-gray-500 text-left">
                      {row.special_price !== null && row.special_price !== undefined
                        ? `Rp ${new Intl.NumberFormat("id-ID").format(row.special_price)} /kg`
                        : "-"}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <ActionMenu
                        trigger={
                          <button
                            disabled={row.ownership_type === "special"}
                            className={`p-2 text-gray-400 rounded-xl transition-colors border border-gray-100 flex items-center justify-center ${
                              row.ownership_type === "special"
                                ? "cursor-not-allowed opacity-50"
                                : "hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
                            }`}
                          >
                            <DotsThreeVertical size={18} weight="bold" />
                          </button>
                        }
                        items={[
                          {
                            label: "Edit",
                            onClick: () => router.push(`/finance/customer/edit/${row.id}`),
                          },
                          {
                            label: "Hapus",
                            variant: "danger",
                            onClick: () => {
                              setSelectedCustomerId(row.id);
                              setSelectedCustomerName(row.name);
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
                  <td colSpan={5} className="px-8 py-10 text-center text-sm font-medium text-gray-400">
                    Tidak ada data customer
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      {!isLoading && customers.length > 0 && (
        <Pagination
          currentPage={pagination.number_page}
          totalPages={pagination.total_page}
          totalData={pagination.total_data}
          showingData={customers.length}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
