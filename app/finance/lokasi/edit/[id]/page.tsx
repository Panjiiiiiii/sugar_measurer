"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react";

interface LocationDetailResponse {
  statusCode: number;
  data: {
    id: string;
    name: string;
    sugar_price: number;
    account_balance: number | null;
    account_number: string | null;
  };
}

export default function EditLokasiPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params.id as string) || "";

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    sugar_price: "",
    account_number: "",
    account_balance: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchLocation() {
      if (!id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch(`/api/location/${id}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch location detail");
        }

        const result = (await response.json()) as LocationDetailResponse;

        if (!isMounted || !result.data) {
          return;
        }

        setFormData({
          name: result.data.name ?? "",
          sugar_price: String(result.data.sugar_price ?? ""),
          account_number: result.data.account_number ?? "",
          account_balance: String(result.data.account_balance ?? 0),
        });
      } catch (error) {
        console.error("Error fetching location detail:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchLocation();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.sugar_price.trim() !== "" &&
    formData.account_number.trim() !== "";

  const handleSave = async () => {
    if (!isFormValid) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/location/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          sugar_price: Number(formData.sugar_price),
          account_number: formData.account_number.trim(),
          account_balance: formData.account_balance.trim()
            ? Number(formData.account_balance)
            : 0,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update location");
      }

      router.push("/finance/lokasi?success=true");
    } catch (error) {
      console.error("Error updating location:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Lokasi</h1>
        </div>
        <div className="max-w-5xl mx-auto w-full rounded-[20px] bg-white border border-gray-100 shadow-sm px-8 py-10 text-sm font-medium text-gray-400">
          Memuat detail lokasi...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Header & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Lokasi</h1>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <span 
            onClick={() => router.push("/finance/lokasi")}
            className="hover:text-gray-900 cursor-pointer transition-colors"
          >
            Data Lokasi
          </span>
          <CaretRight size={10} weight="bold" className="text-gray-300" />
          <span className="text-gray-900">Edit Lokasi</span>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-5xl mx-auto space-y-6 w-full">
        <div className="bg-white border border-gray-100 rounded-[20px] shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 bg-white">
            <h2 className="text-base font-bold text-gray-900">Form Lokasi</h2>
          </div>
          
          <div className="p-8 space-y-6">
            {/* Nama Lokasi */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-950 block">
                Name <span className="text-red-500 font-bold">*</span>
              </label>
              <input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
                placeholder="Masukkan nama lokasi"
              />
            </div>

            {/* Sugar Price */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-950 block">
                Harga Tebu <span className="text-red-500 font-bold">*</span>
              </label>
              <input 
                type="number"
                value={formData.sugar_price}
                onChange={(e) => setFormData({ ...formData, sugar_price: e.target.value })}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
                placeholder="Masukkan harga gula"
              />
            </div>

            {/* Account Number */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-950 block">
                Nomor Rekening <span className="text-red-500 font-bold">*</span>
              </label>
              <input 
                type="text"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value.replace(/\D/g, "") })}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
                placeholder="Masukkan nomor rekening lokasi"
              />
            </div>

            {/* Account Balance */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-950 block">
                Saldo Awal (IDR)
              </label>
              <input 
                type="number"
                value={formData.account_balance}
                onChange={(e) => setFormData({ ...formData, account_balance: e.target.value })}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
                placeholder="Masukkan saldo awal lokasi"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => router.back()}
            className="w-full py-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 hover:bg-gray-50 active:bg-gray-100/80 transition-all shadow-sm cursor-pointer"
            suppressHydrationWarning
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
            className={`w-full py-4 text-white rounded-2xl text-sm font-bold transition-all shadow-md ${
              isFormValid && !isSaving
                ? "bg-[#009262] hover:bg-[#007a52] active:bg-[#006342] cursor-pointer" 
                : "bg-gray-300 cursor-not-allowed shadow-none"
            }`}
            suppressHydrationWarning
          >
            {isSaving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
