"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
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

export default function TrukPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const role = Array.isArray(params.role) ? params.role[0] : (params.role || "branch");
  
  const [isLoading, setIsLoading] = useState(true);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Simulating data fetch
  useEffect(() => {
    const fetchTrucks = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData: Truck[] = Array(10).fill(null).map((_, i) => ({
        id: (i + 1).toString(),
        name: `Truck Scania ${i + 1}`,
        license_plate: `N ${1234 + i} AC`,
        truck_type: i % 2 === 0 ? "Engkel" : "Double"
      }));
      
      setTrucks(mockData);
      setIsLoading(false);
    };

    fetchTrucks();
  }, []);

  return (
    <div className="flex flex-col w-full max-w-full pb-10">
      <Toast 
        isVisible={showToast} 
        message="Data Berhasil Disimpan" 
        type="success" 
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
        onEdit={(id) => router.push(`/${role}/truk/edit/${id}`)}
        onDelete={(id) => {
          setSelectedTruckId(id);
          setIsDeleteOpen(true);
        }}
      />

      <TrukFilterModal 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(f) => console.log("Apply truck filters", f)}
      />

      <DeleteModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          console.log("Delete truck", selectedTruckId);
          setIsDeleteOpen(false);
        }}
        message="Apakah anda yakin ingin menghapus data truck ini?"
      />
    </div>
  );
}
