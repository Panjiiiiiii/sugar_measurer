"use client";

import React, { useState } from "react";
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

export default function InputTrukPage() {
  const router = useRouter();
  const params = useParams();
  const role = (params.role as string) || "branch";
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    nopol: "",
    namaTruk: "",
    type: "",
  });

  const isFormValid = 
    form.nopol.trim() !== "" && 
    form.namaTruk.trim() !== "" && 
    form.type !== "";

  const handleSave = async () => {
    if (!isFormValid || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await axios.post("/api/truck", {
        license_plate: form.nopol.trim().toUpperCase(),
        name: form.namaTruk.trim(),
        truck_type: form.type.toLowerCase(),
      });

      sessionStorage.setItem(
        "truck-toast-message",
        response.data?.message || "Truck berhasil disimpan",
      );
      router.push(`/${role}/truk?success=true`);
    } catch (error) {
      console.error("Error saving truck:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full pb-10">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Input Truk</h1>
          <Breadcrumbs 
            items={[
              { label: "Truk", href: `/${role}/truk` },
              { label: "Input Truk", active: true }
            ]} 
          />
        </div>
      </div>

      {/* Form Card */}
      <Card title="Form Truk">
        <div className="flex flex-col gap-6">
          <Input 
            label="Nopol" 
            placeholder="Input Nopol"
            value={form.nopol}
            onChange={(e) => setForm({ ...form, nopol: e.target.value })}
            required
          />
          
          <Input 
            label="Nama Truk" 
            placeholder="Input Nama Truk"
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
