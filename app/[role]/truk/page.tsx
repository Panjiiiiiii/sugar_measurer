"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";xios";xios";xios";
import { PageHeader } from "@/components/dashboard/PageHeader";
import TrukTable from "@/components/dashboard/TrukTable";
import TrukFilterModal from "@/components/dashboard/TrukFilterModal";
import { Toast, DeleteModal } from "@/components/ui";

interface Truck {
  id: string;
  name: string;
  license_plate: string;
  truck_type: string;
}

interface PaginationMeta {
  per_page: number;
  number_page: number;
  total_page: number;
  total_data: number;
}

interface TruckListResponse {
  data: Truck[];
  page: PaginationMeta;
}

export default function TrukPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const role = Array.isArray(params.role) ? params.role[0] : (params.role || "branch");
  const currentPage = Number(searchParams.get("page") || 1);
  const currentTruckType = searchParams.get("truck_type") || searchParams.get("type_truck") || "";
  
  const [isLoading, setIsLoading] = useState(true);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    per_page: 0,
    number_page: 1,
    total_page: 1,
    total_data: 0,
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Data Berhasil Disimpan");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeletingTruck, setIsDeletingTruck] = useState(false);
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      const storedMessage = sessionStorage.getItem("truck-toast-message");
      if (storedMessage) {
        setToastMessage(storedMessage);
        sessionStorage.removeItem("truck-toast-message");
        setShowToast(true);
        const timer = setTimeout(() => {
          setShowToast(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchTrucks = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<TruckListResponse>("/api/truck", {
          params: {
            page: currentPage,
            limit: 10,
            type_truck: currentTruckType || undefined,
          },
        });

        setTrucks(response.data.data ?? []);
        setPagination(
          response.data.page ?? {
            per_page: response.data.data?.length ?? 0,
            number_page: currentPage,
            total_page: 1,
            total_data: response.data.data?.length ?? 0,
          },
        );
      } catch (error) {
        console.error("Error fetching trucks:", error);
        setTrucks([]);
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

    fetchTrucks();
  }, [currentPage, currentTruckType]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.total_page) {
      return;
    }

    const nextParams = new URLSearchParams();
    nextParams.set("page", String(page));

    if (currentTruckType) {
      nextParams.set("truck_type", currentTruckType);
    }

    router.push(`/${role}/truk?${nextParams.toString()}`);
  };

  const handleFilterApply = (filters: { type: string }) => {
    const nextParams = new URLSearchParams();
    nextParams.set("page", "1");

    if (filters.type) {
      nextParams.set("truck_type", filters.type.toLowerCase());
    }

    router.push(`/${role}/truk?${nextParams.toString()}`);
    setIsFilterOpen(false);
  };

  return (
    <div className="flex flex-col w-full max-w-full pb-10">
      <Toast 
        isVisible={showToast} 
        message={toastMessage} 
        type={toastMessage.toLowerCase().includes("gagal") ? "error" : "success"} 
      />

      <PageHeader 
        title="Truk"
        primaryAction={{
          label: "Add",
          onClick: () => router.push(`/${role}/truk/add`)
        }}
        secondaryAction={{
          label: "Filter",
          onClick: () => setIsFilterOpen(true)
        }}
      />

      <TrukTable 
        data={trucks}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onEdit={(id) => router.push(`/${role}/truk/edit/${id}`)}
        onDelete={(id) => {
          setSelectedTruckId(id);
          setIsDeleteOpen(true);
        }}
      />

      <TrukFilterModal 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        initialType={currentTruckType}
        onApply={handleFilterApply}
      />

      <DeleteModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        isLoading={isDeletingTruck}
        onConfirm={async () => {
          if (!selectedTruckId) return;
          
          try {
            setIsDeletingTruck(true);
            const response = await axios.delete<{
              statusCode: number;
              message: string;
            }>(`/api/truck/${selectedTruckId}`);
            
            sessionStorage.setItem(
              "truck-toast-message",
              response.data?.message || "Truck berhasil dihapus",
            );
            window.location.href = `/${role}/truk?success=true`;
          } catch (error) {
            console.error("Error deleting truck:", error);
            setToastMessage("Gagal menghapus truck");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
          } finally {
            setIsDeletingTruck(false);
            setSelectedTruckId(null);
          }
        }}
        message="Apakah anda yakin ingin menghapus data truck ini?"
      />
    </div>
  );
}
