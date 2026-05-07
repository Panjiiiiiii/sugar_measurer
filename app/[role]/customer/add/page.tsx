"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CaretDown } from "@phosphor-icons/react";
import { Card, Input, Select, Button, Breadcrumbs } from "@/components/ui";
import axios from "axios";

export default function InputCustomerPage() {
  const params = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const role = (params.role as string) || "branch";

  const [form, setForm] = useState({
    nama: "",
    typeOwner: "",
    phoneNumber: "",
    specialPrice: "",
  });

  const isFormValid =
    form.nama &&
    form.typeOwner &&
    form.phoneNumber &&
    (form.typeOwner !== "special" || form.specialPrice);

  const handleSave = async () => {
    if (!isFormValid || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await axios.post("/api/owner", {
        nama_owner: form.nama.trim(),
        type_ownership: form.typeOwner.trim(),
        special_price: form.specialPrice
          ? parseFloat(form.specialPrice)
          : undefined,
        phone_number: form.phoneNumber.trim(),
      });

      sessionStorage.setItem(
        "customer-toast-message",
        response.data?.message || "Customer berhasil disimpan",
      );
      router.push(`/${role}/customer?success=true`);
    } catch (error) {
      console.error("Error saving owner:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full pb-10">
      {/* Header & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Input Customer
        </h1>
        <Breadcrumbs
          items={[
            { label: "Data Customer", href: `/${role}/customer` },
            { label: "Input Customer", active: true },
          ]}
        />
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
        <Card title="Form Customer">
          <div className="flex flex-col gap-6 py-2">
            <Input
              label="Nama"
              required
              placeholder="Masukkan nama customer"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
            />
            <Select
              label="Tipe customer"
              required
              value={form.typeOwner}
              onChange={(e) => setForm({ ...form, typeOwner: e.target.value })}
              icon={<CaretDown size={18} weight="bold" />}
              options={[
                { value: "", label: "Pilih tipe kepemilikan" },
                { value: "farmer", label: "Petani" },
                { value: "private", label: "Private" },
                { value: "special", label: "Special" },
              ]}
            />

            {form.typeOwner === "special" && (
              <Input
                label="Harga Khusus"
                required
                placeholder="Masukkan harga khusus"
                value={form.specialPrice}
                onChange={(e) =>
                  setForm({ ...form, specialPrice: e.target.value })
                }
              />
            )}
            
            <Input
              label="Nomor Telepon"
              required
              placeholder="Masukkan nomor telepon"
              value={form.phoneNumber}
              onChange={(e) =>
                setForm({ ...form, phoneNumber: e.target.value })
              }
            />
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button
            variant="white"
            className="flex-1 py-4 text-sm font-bold shadow-none border-gray-100"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className={`flex-1 py-4 text-sm font-bold bg-[#009262] hover:bg-[#007a52] ${!isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!isFormValid}
            onClick={handleSave}
          >
            Simpan
          </Button>
        </div>
      </div>
    </div>
  );
}
