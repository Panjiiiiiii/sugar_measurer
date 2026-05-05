"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AntrianTable } from "@/components/dashboard/AntrianTable";
import { RiwayatTimbanganTable } from "@/components/dashboard/RiwayatTimbanganTable";
import { StatCard } from "@/components/ui/StatCard";
import { DeleteModal, Toast } from "@/components/ui";
import TimbanganFilterModal from "@/components/dashboard/TimbanganFilterModal";

export default function TimbanganPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (params.role as string) || "branch";

  const [isLoading, setIsLoading] = useState(true);
  const [antrian, setAntrian] = useState<any[]>([]);
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockAntrian = [1, 2, 3].map(i => ({
        id: i.toString(),
        transaction_date: "01/01/2026",
        loading_in: "15:00",
        license_plate: `N ${1234 + i} AC`,
        driver_name: "Budi",
        ownership_type: i % 2 === 0 ? "private" : "farmer",
        customer_name: "Abah",
        bruto_weight: 100
      }));

      const mockRiwayat = [1, 2, 3, 4].map(i => ({
        id: (i + 10).toString(),
        transaction_date: "05/04/2026",
        loading_in: "15:00",
        loading_out: "16:00",
        license_plate: `N ${5678 + i} AC`,
        driver_name: "Budi",
        ownership_type: i % 3 === 0 ? "private" : "farmer",
        customer_name: "Abah",
        bruto_weight: 100,
        tarra_weight: 25,
        netto_weight: 75,
        total_price: 500000,
        payment_method: "cash",
        status: i % 2 === 0 ? "paid" : "unpaid"
      }));

      setAntrian(mockAntrian);
      setRiwayat(mockRiwayat);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col w-full max-w-full pb-10">
      <Toast 
        isVisible={showToast} 
        message="Data Berhasil Disimpan" 
        type="success" 
      />
      <PageHeader 
        title="Timbangan"
        primaryAction={{
          label: "Add",
          onClick: () => router.push(`/${role}/timbangan/add`)
        }}
        secondaryAction={{
          label: "Filter",
          onClick: () => setIsFilterOpen(true)
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="Today" value="4 Truk" subValue="In Queue" />
        <StatCard label="Today" value="Rp 600.000.000" subValue="Paid" />
        <StatCard label="Today" value="Rp 20.000.000" subValue="Unpaid" />
        <StatCard label="Harga Patokan" value="Rp 7.500" subValue="Harga tebu" />
      </div>

      <div className="flex flex-col gap-8">
        <AntrianTable data={antrian} isLoading={isLoading} role={role} />
        
        <RiwayatTimbanganTable 
          data={riwayat} 
          isLoading={isLoading} 
          onEdit={(id) => router.push(`/${role}/timbangan/edit/${id}`)}
          onDelete={(id) => {
            setSelectedId(id);
            setIsDeleteOpen(true);
          }}
          onStatusChange={(id, status) => console.log("Status change", id, status)}
        />
      </div>

      <TimbanganFilterModal 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(f) => console.log("Filter", f)}
      />

      <DeleteModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => console.log("Delete", selectedId)}
      />
    </div>
  );
}
