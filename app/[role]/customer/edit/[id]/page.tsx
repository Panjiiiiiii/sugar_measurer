"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { 
  CaretDown 
} from "@phosphor-icons/react";
import { 
  Card, 
  Input, 
  Select, 
  Button, 
  Breadcrumbs,
  Toast,
  DeleteModal 
} from "@/components/ui";

interface CustomerData {
  id: string;
  name: string;
  ownership_type: "farmer" | "private" | "special";
  phone_number: string;
  special_price?: number;
}

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const role = (params.role as string) || "branch";
  const customerId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [formData, setFormData] = useState({
    nama: "",
    typeOwner: "",
    phoneNumber: "",
    specialPrice: ""
  });

  // Fetch customer data on mount
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<{ statusCode: number; data: CustomerData }>(
          `/api/owner/${customerId}`
        );
        
        const customer = response.data.data;
        setFormData({
          nama: customer.name || "",
          typeOwner: customer.ownership_type || "",
          phoneNumber: customer.phone_number || "",
          specialPrice: customer.special_price?.toString() || ""
        });
      } catch (error) {
        console.error("Error fetching customer:", error);
        setToastMessage("Gagal memuat data customer");
        setShowToast(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  const isFormValid = formData.nama && formData.typeOwner && formData.phoneNumber &&
    (formData.typeOwner !== "special" || formData.specialPrice);

  const handleSave = async () => {
    if (!isFormValid || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await axios.put<{ statusCode: number; message: string }>(
        `/api/owner/${customerId}`,
        {
          nama_owner: formData.nama.trim(),
          type_ownership: formData.typeOwner.trim(),
          special_price: formData.specialPrice ? parseFloat(formData.specialPrice) : undefined,
          phone_number: formData.phoneNumber.trim(),
        }
      );

      sessionStorage.setItem(
        "customer-toast-message",
        response.data?.message || "Customer berhasil diupdate",
      );
      router.push(`/${role}/customer?success=true`);
    } catch (error) {
      console.error("Error saving customer:", error);
      setToastMessage("Gagal menyimpan customer");
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSaving(true);
      const response = await axios.delete<{ statusCode: number; message: string }>(
        `/api/owner/${customerId}`
      );

      sessionStorage.setItem(
        "customer-toast-message",
        response.data?.message || "Customer berhasil dihapus",
      );
      router.push(`/${role}/customer?success=true`);
    } catch (error) {
      console.error("Error deleting customer:", error);
      setToastMessage("Gagal menghapus customer");
      setShowToast(true);
    } finally {
      setIsSaving(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-full pb-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-100 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-full pb-10">
      <Toast
        isVisible={showToast}
        message={toastMessage}
        type="error"
      />

      {/* Header & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Customer</h1>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <span 
            onClick={() => router.push(`/${role}/customer`)}
            className="hover:text-gray-900 cursor-pointer transition-colors"
          >
            Data Customer
          </span>
          <CaretRight size={10} weight="bold" className="text-gray-300" />
          <span className="text-gray-900">Edit Customer</span>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
        <Card title="Form Customer">
          <div className="flex flex-col gap-6 py-2">
            <Input 
              label="Nama" 
              required
              placeholder="Masukkan nama customer"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            />
            
            <Select 
              label="Tipe Customer" 
              required
              value={formData.typeOwner}
              onChange={(e) => setFormData({ ...formData, typeOwner: e.target.value })}
              icon={<CaretDown size={18} weight="bold" />}
              options={[
                { value: "", label: "Pilih tipe kepemilikan" },
                { value: "farmer", label: "Petani" },
                { value: "private", label: "Private" },
                { value: "special", label: "Special" }
              ]}
            />

            <Input 
              label="Nomor Telepon" 
              required
              type="number"
              placeholder="Masukkan nomor telepon"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />

            {formData.typeOwner === "special" && (
              <Input
                label="Harga Khusus"
                required
                type="number"
                placeholder="Masukkan harga khusus"
                value={formData.specialPrice}
                onChange={(e) =>
                  setFormData({ ...formData, specialPrice: e.target.value })
                }
              />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            className={`flex-1 py-4 text-sm font-bold bg-[#009262] hover:bg-[#007a52] ${!isFormValid || isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!isFormValid || isSaving}
            onClick={handleSave}
          >
            {isSaving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
