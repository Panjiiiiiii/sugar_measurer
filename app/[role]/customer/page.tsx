"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { CustomerTable } from "@/components/dashboard/CustomerTable";
import { DeleteModal, Toast, Select } from "@/components/ui";
import axios from "@/lib/axios";
import CustomerFilterModal from "@/components/dashboard/CustomerFilterModal";

interface Customer {
  id: string;
  name: string;
  ownership_type: "farmer" | "private";
  phone_number: string;
  special_price: number;
}

// Pagination metadata type
interface PaginationMeta {
  per_page: number;
  number_page: number;
  total_page: number;
  total_data: number;
}

interface OwnerListResponse {
  data: Customer[];
  page: PaginationMeta;
}

export default function CustomerPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleRaw = params.role as string;
  const role = !roleRaw || roleRaw === "undefined" ? "branch" : roleRaw;
  const currentPage = Number(searchParams.get("page") || 1);
  const currentOwnershipType =
    searchParams.get("ownership_type") ||
    searchParams.get("type_ownership") ||
    "";
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("Data Berhasil Disimpan");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingCustomer, setIsDeletingCustomer] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [showToast, setShowToast] = useState(false);
  const [pagination, setPagination] = useState<PaginationMeta>({
    per_page: 0,
    number_page: 1,
    total_page: 1,
    total_data: 0,
  });

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      const storedMessage = sessionStorage.getItem("customer-toast-message");
      if (storedMessage) {
        setToastMessage(storedMessage);
        sessionStorage.removeItem("customer-toast-message");
        setShowToast(true);

        const timer = setTimeout(() => {
          setShowToast(false);
          // Bersihkan ?success=true dari URL supaya effect tidak re-trigger
          const cleanParams = new URLSearchParams(searchParams.toString());
          cleanParams.delete("success");
          router.replace(`/${role}/customer?${cleanParams.toString()}`);
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [searchParams]);

  // Simulating data fetch from backend
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<OwnerListResponse>("/api/owner", {
          params: {
            page: currentPage,
            limit: 10,
            ownership_type: currentOwnershipType || undefined,
          },
        });
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
        console.error("Error fetching customers:", error);
        setCustomers([]);
        setPagination({
          per_page: 0,
          number_page: currentPage,
          total_page: 1,
          total_data: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
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

    router.push(`/${role}/customer?${nextParams.toString()}`);
  };

  const handleFilterApply = (filters: { type: string }) => {
    const nextParams = new URLSearchParams();
    nextParams.set("page", "1");

    if (filters.type) {
      nextParams.set("ownership_type", filters.type.toLowerCase());
    }

    router.push(`/${role}/customer?${nextParams.toString()}`);
    setIsFilterOpen(false);
  };

  return (
    <div className="space-y-8 w-full max-w-full">
      <Toast
        isVisible={showToast}
        message={toastMessage}
        type="success"
        onClose={() => setShowToast(false)}
      />

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
                router.push(`/${role}/customer?${nextParams.toString()}`);
              }}
              options={[
                { value: "", label: "Type Owner" },
                { value: "farmer", label: "Petani" },
                { value: "private", label: "Private" },
                { value: "special", label: "Khusus" },
              ]} 
            />
          </div>
        }
        primaryAction={{
          label: "Add",
          onClick: () => router.push(`/${role}/customer/add`),
        }}
      />
      <CustomerTable
        data={customers}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onEdit={(id) => router.push(`/${role}/customer/edit/${id}`)}
        onDelete={(id) => {
          setSelectedCustomerId(id);
          setIsDeleteModalOpen(true);
        }}
      />
      <CustomerFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleFilterApply}
        initialType={currentOwnershipType}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        isLoading={isDeletingCustomer}
        onConfirm={async () => {
          if (!selectedCustomerId) return;

          try {
            setIsDeletingCustomer(true);
            const response = await axios.delete<{
              statusCode: number;
              message: string;
            }>(`/api/owner/${selectedCustomerId}`);

            sessionStorage.setItem(
              "customer-toast-message",
              response.data?.message || "Customer berhasil dihapus",
            );
            window.location.href = `/${role}/customer?success=true`;
          } catch (error) {
            console.error("Error deleting customer:", error);
            setToastMessage("Gagal menghapus customer");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
          } finally {
            setIsDeletingCustomer(false);
            setSelectedCustomerId(null);
          }
        }}
        message="Apakah anda yakin ingin menghapus data user ini?"
      />
    </div>
  );
}
