"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CaretDown, CaretRight } from "@phosphor-icons/react";

// Mock customer data lookup to pre-populate dynamically
const mockCustomers: Record<string, { name: string; type: string; phone: string }> = {
  "1": { name: "Budi", type: "Petani", phone: "087459687412" },
  "2": { name: "Dadang", type: "Private", phone: "087459687412" },
  "3": { name: "Julpan", type: "Petani", phone: "087459687412" },
  "4": { name: "Jaedin", type: "Private", phone: "087459687412" },
  "budi": { name: "Budi", type: "Petani", phone: "087459687412" },
  "dadang": { name: "Dadang", type: "Private", phone: "087459687412" },
  "julpan": { name: "Julpan", type: "Petani", phone: "087459687412" },
  "jaedin": { name: "Jaedin", type: "Private", phone: "087459687412" },
};

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const idRaw = (params.id as string) || "budi";
  const id = idRaw.toLowerCase();

  const [formData, setFormData] = useState({
    nama: "Budi",
    typeOwner: "Petani",
    phoneNumber: "087459687412"
  });

  // Pre-populate data based on the dynamic route ID parameter
  useEffect(() => {
    if (id && mockCustomers[id]) {
      setFormData({
        nama: mockCustomers[id].name,
        typeOwner: mockCustomers[id].type,
        phoneNumber: mockCustomers[id].phone
      });
    }
  }, [id]);

  const isFormValid = formData.nama.trim() !== "" && formData.typeOwner !== "" && formData.phoneNumber.trim() !== "";

  const handleSave = () => {
    if (!isFormValid) return;
    // Simulate save by routing back to data customer page with success query
    router.push("/finance/customer?success=true");
  };

  return (
    <div className="p-8 space-y-8 bg-[#F9FAFB] min-h-[calc(100vh-72px)] w-full">
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
                Type Owner
              </label>
              <div className="relative group">
                <select 
                  value={formData.typeOwner}
                  onChange={(e) => setFormData({ ...formData, typeOwner: e.target.value })}
                  className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled hidden></option>
                  <option value="Petani">Petani</option>
                  <option value="Private">Private</option>
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
                Phone Number
              </label>
              <input 
                type="text"
                value={formData.phoneNumber || ""}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, "") })}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-300"
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
            disabled={!isFormValid}
            className={`w-full py-4 text-white rounded-2xl text-sm font-bold transition-all shadow-md ${
              isFormValid 
                ? "bg-[#009262] hover:bg-[#007a52] active:bg-[#006342] cursor-pointer" 
                : "bg-gray-300 cursor-not-allowed shadow-none"
            }`}
            suppressHydrationWarning
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
