"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CaretDown, CaretRight } from "@phosphor-icons/react";
import { DeleteModal, Toast } from "@/components/ui";

interface OwnerDetailResponse {
  statusCode: number;
  data: {
    id: string;
    name: string;
    phone_number: string;
    ownership_type: "farmer" | "private" | "special";
    special_price: number | null;
  };
}

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params.id as string) || "";

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Customer berhasil diperbarui");

  const [formData, setFormData] = useState({
    nama: "",
    typeOwner: "",
    phoneNumber: "",
    specialPrice: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchCustomer() {
      if (!id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch(`/api/owner/${id}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch customer detail");
        }

        const result = (await response.json()) as OwnerDetailResponse;

        if (!isMounted || !result.data) {
          return;
        }

        setFormData({
          nama: result.data.name ?? "",
          typeOwner: result.data.ownership_type ?? "",
          phoneNumber: result.data.phone_number ?? "",
          specialPrice: String(result.data.special_price ?? ""),
        });
      } catch (error) {
        console.error("Error fetching customer detail:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchCustomer();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const isSpecialOwner = formData.typeOwner === "special";
  const isFormValid =
    formData.nama.trim() !== "" &&
    formData.typeOwner !== "" &&
    formData.phoneNumber.trim() !== "" &&
    (!isSpecialOwner || formData.specialPrice.trim() !== "");

  const handleSave = async () => {
    if (!isFormValid) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/owner/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama_owner: formData.nama.trim(),
          phone_number: formData.phoneNumber.trim(),
          type_ownership: formData.typeOwner,
          ...(isSpecialOwner
            ? { special_price: Number(formData.specialPrice) }
            : { special_price: undefined }),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update customer");
      }

      sessionStorage.setItem("customer-toast-message", "Customer berhasil diperbarui");

      router.push("/finance/customer?success=true");
    } catch (error) {
      console.error("Error updating customer:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!id) {
      setIsDeleteModalOpen(false);
      return;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/owner/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      const result = (await response.json()) as { message?: string };
      sessionStorage.setItem(
        "customer-toast-message",
        result.message || "Customer berhasil dihapus",
      );
      router.push("/finance/customer?success=true");
    } catch (error) {
      console.error("Error deleting customer:", error);
      setToastMessage("Gagal menghapus customer");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 bg-[#F9FAFB] min-h-[calc(100vh-72px)] w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Customer</h1>
        </div>
        <div className="max-w-5xl mx-auto w-full rounded-[20px] bg-white border border-gray-100 shadow-sm px-8 py-10 text-sm font-medium text-gray-400">
          Memuat detail customer...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-[#F9FAFB] min-h-[calc(100vh-72px)] w-full">
      <Toast isVisible={showToast} message={toastMessage} type="success" />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        message="Apakah anda yakin ingin menghapus customer ini?"
      />
      {/* Header & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Customer</h1>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <span 
            onClick={() => router.push("/finance/customer")}
            className="hover:text-gray-900 cursor-pointer transition-colors"
          >
            Data Customer
          </span>
          <CaretRight size={10} weight="bold" className="text-gray-300" />
          <span className="text-gray-900">Edit Customer</span>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-5xl mx-auto space-y-6 w-full">
        <div className="bg-white border border-gray-100 rounded-[20px] shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 bg-white">
            <h2 className="text-base font-bold text-gray-900">Form Customer</h2>
          </div>
          
          <div className="p-8 space-y-6">
            {/* Nama */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-950 block">
                Nama
              </label>
              <input 
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
              />
            </div>

            {/* Type Owner */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-950 block">
                Tipe kepemilikan
              </label>
              <div className="relative group">
                <select 
                  value={formData.typeOwner}
                  onChange={(e) => setFormData({ ...formData, typeOwner: e.target.value })}
                  className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled hidden></option>
                  <option value="farmer">Petani</option>
                  <option value="private">Pribadi</option>
                </select>
                <CaretDown 
                  size={16} 
                  weight="bold" 
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600 transition-colors"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-950 block">
                Nomor Telepon
              </label>
              <input 
                type="number"
                value={formData.phoneNumber || ""}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, "") })}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
              />
            </div>

            {isSpecialOwner && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-950 block">
                  Special Price
                </label>
                <input
                  type="text"
                  value={formData.specialPrice}
                  onChange={(e) => setFormData({ ...formData, specialPrice: e.target.value.replace(/\D/g, "") })}
                  className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
                  placeholder="Masukkan special price"
                />
              </div>
            )}
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

        <div className="max-w-5xl mx-auto w-full">
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full py-4 bg-white border border-red-200 rounded-2xl text-sm font-bold text-red-600 hover:bg-red-50 active:bg-red-100/80 transition-all shadow-sm cursor-pointer"
            suppressHydrationWarning
          >
            Hapus Customer
          </button>
        </div>
      </div>
    </div>
  );
}
