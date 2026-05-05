"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Clock, 
  CaretDown 
} from "@phosphor-icons/react";
import { 
  Card, 
  Input, 
  Select, 
  Button, 
  Breadcrumbs, 
  Switch 
} from "@/components/ui";

export default function EditTimbanganPage() {
  const params = useParams();
  const router = useRouter();
  const role = (params.role as string) || "branch";
  const id = params.id;

  const [isHargaSpesial, setIsHargaSpesial] = useState(true);
  const [formData, setFormData] = useState({
    nopol: "N 1234 AC",
    customer: "Abah",
    supir: "Budi",
    masuk: "15:00",
    keluar: "16:00",
    bruto: "100",
    tara: "50",
    harga: "7.900",
    paymentMethod: "Cash",
    netto: "10",
    outputHarga: "500.000"
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-full pb-10">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="white" 
              size="sm" 
              onClick={() => router.back()}
              className="p-2"
              icon={<ArrowLeft size={18} weight="bold" className="text-gray-600" />}
            />
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Edit Timbangan
            </h1>
          </div>
          <Breadcrumbs 
            items={[
              { label: "Timbangan", href: `/${role}/timbangan` },
              { label: "Edit Timbangan", active: true }
            ]} 
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Timbangan */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card title="Form Timbangan" className="h-full">
            <div className="flex flex-col gap-5">
              <Input 
                label="Input Nopol" 
                required 
                value={formData.nopol}
                onChange={(e) => setFormData({ ...formData, nopol: e.target.value })}
              />
              
              <Input 
                label="Customer" 
                required 
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              />

              <Input 
                label="Supir" 
                required 
                value={formData.supir}
                onChange={(e) => setFormData({ ...formData, supir: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Masuk" 
                  required 
                  value={formData.masuk}
                  onChange={(e) => setFormData({ ...formData, masuk: e.target.value })}
                  icon={<Clock size={20} className="text-gray-400" />}
                />
                <Input 
                  label="Keluar" 
                  value={formData.keluar}
                  onChange={(e) => setFormData({ ...formData, keluar: e.target.value })}
                  icon={<Clock size={20} className="text-gray-400" />}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Bruto(Kg)" 
                  required 
                  value={formData.bruto}
                  onChange={(e) => setFormData({ ...formData, bruto: e.target.value })}
                />
                <Input 
                  label="Tara(Kg)" 
                  value={formData.tara}
                  onChange={(e) => setFormData({ ...formData, tara: e.target.value })}
                />
              </div>

              <Switch 
                label="Harga Spesial" 
                checked={isHargaSpesial} 
                onChange={setIsHargaSpesial} 
              />

              <Input 
                label="Harga" 
                required 
                disabled={!isHargaSpesial}
                value={formData.harga}
                onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
              />

              <Select 
                label="Payment Method" 
                required 
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                icon={<CaretDown size={18} weight="bold" />}
                options={[
                  { value: "Cash", label: "Cash" },
                  { value: "Transfer", label: "Transfer" }
                ]}
              />
            </div>
          </Card>
        </div>

        {/* Right Column: Output Timbangan */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card title="Output Timbangan">
            <div className="flex flex-col gap-5">
              <Input 
                label="Output Netto(kw)" 
                value={formData.netto}
                onChange={(e) => setFormData({ ...formData, netto: e.target.value })}
              />
              <Input 
                label="Output Harga" 
                value={formData.outputHarga}
                onChange={(e) => setFormData({ ...formData, outputHarga: e.target.value })}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <Button 
            variant="white" 
            className="w-full py-4 text-sm font-bold"
            onClick={() => router.back()}
          >
            Batal
          </Button>
        </div>
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Button 
            variant="white" 
            className="w-full py-4 text-sm font-bold"
            onClick={() => console.log("Print Struk")}
          >
            Print Struk
          </Button>
          <Button 
            variant="primary" 
            className="w-full py-4 text-sm font-bold bg-[#009262] hover:bg-[#007a52]"
            onClick={() => console.log("Simpan", formData)}
          >
            Simpan
          </Button>
        </div>
      </div>
    </div>
  );
}
