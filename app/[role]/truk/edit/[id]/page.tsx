"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { CaretDown } from "@phosphor-icons/react";
import { 
  Card, 
  Input, 
  Select, 
  Button, 
  Breadcrumbs 
} from "@/components/ui";

interface TruckData {
  id: string;
  license_plate: string;
  name: string;
  truck_type: string | null;
  created_at: string;
  updated_at: string;
}

export default function EditTrukPage() {
  const router = useRouter();
  const params = useParams();
  const role = (params.role as string) || "branch";
  const id = (params.id as string) || "";

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    nopol: "",
    namaTruk: "",
    type: "",
  });

  useEffect(() => {
    const fetchTruck = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await axios.get<{
          statusCode: number;
          message: string;
          data: TruckData;
        }>(`/api/truck/${id}`);

        const truck = response.data.data;
        setForm({
          nopol: truck.license_plate ? truck.license_plate.toUpperCase() : "",
          namaTruk: truck.name,
          type: truck.truck_type
            ? truck.truck_type.charAt(0).toUpperCase() + truck.truck_type.slice(1).toLowerCase()
            : "",
        });
      } catch (error) {
        console.error("Error fetching truck:", error);
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    fetchTruck();
  }, [id, router]);

  const isFormValid = 
    form.nopol.trim() !== "" && 
    form.namaTruk.trim() !== "" && 
    form.type !== "";

  const handleSave = async () => {
    if (!isFormValid || isSaving || !id) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await axios.put<{
        statusCode: number;
        message: string;
      }>(`/api/truck/${id}`, {
        license_plate: form.nopol.trim().toUpperCase(),
        name: form.namaTruk.trim(),
        truck_type: form.type.toLowerCase(),
      });

      sessionStorage.setItem(
        "truck-toast-message",
        response.data?.message || "Truck berhasil diperbarui",
      );
      router.push(`/${role}/truk?success=true`);
    } catch (error) {
      console.error("Error updating truck:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-full pb-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Truk</h1>
        </div>
        <Card title="Form Truk">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-xl"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-full pb-10">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Truk</h1>
          <Breadcrumbs 
            items={[
              { label: "Truk", href: `/${role}/truk` },
              { label: "Edit Truk", active: true }
            ]} 
          />
        </div>
      </div>

      {/* Form Card */}
      <Card title="Form Truk">
        <div className="flex flex-col gap-6">
          <Input 
            label="Nopol" 
            value={form.nopol}
            onChange={(e) => setForm({ ...form, nopol: e.target.value })}
            required
          />
          
          <Input 
            label="Nama Truk" 
            value={form.namaTruk}
            onChange={(e) => setForm({ ...form, namaTruk: e.target.value })}
            required
          />

          <Select 
            label="Type" 
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            required
            icon={<CaretDown size={18} weight="bold" />}
            options={[
              { value: "", label: "Pilih Type" },
              { value: "Engkel", label: "Engkel" },
              { value: "Double", label: "Double" }
            ]}
          />
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Button 
          variant="white" 
          className="w-full py-4 text-sm font-bold"
          onClick={() => router.back()}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button 
          variant="primary" 
          className="w-full py-4 text-sm font-bold bg-[#009262] hover:bg-[#007a52]"
          onClick={handleSave}
          disabled={!isFormValid || isSaving}
        >
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
