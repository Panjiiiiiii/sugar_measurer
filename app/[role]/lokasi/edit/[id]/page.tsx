"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react";

export default function EditLokasiRolePage() {
  const params = useParams();
  const router = useRouter();
  const roleRaw = params.role as string;
  const role = (!roleRaw || roleRaw === "undefined") ? "branch" : roleRaw;
  const id = params.id as string;

  const [formData, setFormData] = useState({
    name: "",
    account_number: "",
    account_balance: "",
    sugar_price: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch detail lokasi untuk pre-populate form
  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/location/${id}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.message ?? "Gagal memuat data lokasi");
          return;
        }
        const data = json.data;
        setFormData({
          name: data.name ?? "",
          account_number: data.account_number ?? "",
          account_balance: String(data.account_balance ?? ""),
          sugar_price: data.sugar_price ?? 0,
        });
      } catch {
        setError("Terjadi kesalahan saat memuat data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.account_number.trim() !== "" &&
    formData.account_balance.trim() !== "";

  const handleSave = async () => {
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/location/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          account_number: formData.account_number,
          account_balance: Number(formData.account_balance),
          sugar_price: formData.sugar_price,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.message ?? "Gagal memperbarui data");
        return;
      }

      router.push(`/${role}/lokasi?success=true`);
    } catch {
      setError("Terjadi kesalahan, coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-full pb-10">
      {/* Header & Breadcrumbs */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Lokasi</h1>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <span
            onClick={() => router.push(`/${role}/lokasi`)}
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
            {/* Error Banner */}
            {error && (
              <div className="px-5 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {/* Loading Skeleton */}
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-32 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="h-14 w-full bg-gray-100 rounded-2xl animate-pulse" />
                </div>
              ))
            ) : (
              <>
                {/* Nama Lokasi */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-950 block">
                    Nama Lokasi <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
                    placeholder="Masukkan nama lokasi (e.g. Malang)"
                  />
                </div>

                {/* Account Number */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-950 block">
                    Account Number <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.account_number}
                    onChange={(e) =>
                      setFormData({ ...formData, account_number: e.target.value.replace(/\D/g, "") })
                    }
                    className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
                    placeholder="Masukkan nomor rekening lokasi"
                  />
                </div>

                {/* Sugar Price */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-950 block">
                    Sugar Price (IDR) <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.sugar_price}
                    onChange={(e) => setFormData({ ...formData, sugar_price: Number(e.target.value) })}
                    className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
                    placeholder="Masukkan harga gula per kg"
                  />
                </div>

                {/* Balance */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-950 block">
                    Balance (IDR) <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.account_balance}
                    onChange={(e) => setFormData({ ...formData, account_balance: e.target.value })}
                    className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
                    placeholder="Masukkan saldo lokasi"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="w-full py-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 hover:bg-gray-50 active:bg-gray-100/80 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid || isSubmitting || isLoading}
            className={`w-full py-4 text-white rounded-2xl text-sm font-bold transition-all shadow-md ${
              isFormValid && !isSubmitting && !isLoading
                ? "bg-[#009262] hover:bg-[#007a52] active:bg-[#006342] cursor-pointer"
                : "bg-gray-300 cursor-not-allowed shadow-none"
            }`}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}