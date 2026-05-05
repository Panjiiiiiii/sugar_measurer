"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  CaretDown 
} from "@phosphor-icons/react";
import { 
  Card, 
  Input, 
  Select, 
  Button, 
  Breadcrumbs 
} from "@/components/ui";

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const role = (params.role as string) || "branch";
  const id = params.id;

  const [formData, setFormData] = useState({
    nama: "Budi",
    typeOwner: "Petani",
    phoneNumber: "087459687412"
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-full pb-10">
      {/* Header & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Customer</h1>
        <Breadcrumbs 
          items={[
            { label: "Data Customer", href: `/${role}/customer` },
            { label: "Edit Customer", active: true }
          ]} 
        />
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
        <Card title="Form Customer">
          <div className="flex flex-col gap-6 py-2">
            <Input 
              label="Nama" 
              placeholder="Masukkan nama customer"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            />
            
            <Select 
              label="Type Owner" 
              placeholder="Pilih type owner"
              value={formData.typeOwner}
              onChange={(e) => setFormData({ ...formData, typeOwner: e.target.value })}
              icon={<CaretDown size={18} weight="bold" />}
              options={[
                { value: "Petani", label: "Petani" },
                { value: "Private", label: "Private" }
              ]}
            />

            <Input 
              label="Phone Number" 
              placeholder="Masukkan nomor telepon"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
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
            className="flex-1 py-4 text-sm font-bold bg-[#009262] hover:bg-[#007a52]"
            onClick={() => console.log("Simpan", formData)}
          >
            Simpan
          </Button>
        </div>
      </div>
    </div>
  );
}
