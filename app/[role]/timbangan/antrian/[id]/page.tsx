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

export default function AntrianTimbanganDetailPage() {
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
    keluar: "",
    bruto: "100",
    tara: "0",
    harga: "7.900",
    paymentMethod: "Cash"
  });

  const isFormValid = 
    formData.nopol && 
    formData.customer && 
    formData.supir && 
    formData.masuk && 
    formData.keluar && 
    formData.bruto && 
    formData.tara && 
    formData.harga && 
    formData.paymentMethod;

  // Derived values
  const brutoVal = parseFloat(formData.bruto) || 0;
  const taraVal = parseFloat(formData.tara) || 0;
  const nettoKw = Math.max(0, brutoVal - taraVal) / 100;
  const hargaVal = parseFloat(formData.harga.replace(/[^0-9]/g, "")) || 0;
  const totalHarga = nettoKw * 100 * hargaVal;
  const totalHargaDisplay = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(totalHarga);

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
              Antrian Timbangan
            </h1>
          </div>
          <Breadcrumbs 
            items={[
              { label: "Timbangan", href: `/${role}/timbangan` },
              { label: "Antrian Timbangan", active: true }
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
                  type="time"
                  value={formData.masuk}
                  onChange={(e) => setFormData({ ...formData, masuk: e.target.value })}
                />
                <Input 
                  label="Keluar" 
                  type="time"
                  value={formData.keluar}
                  onChange={(e) => setFormData({ ...formData, keluar: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Bruto(Kg)" 
                  required 
                  type="number"
                  value={formData.bruto}
                  onChange={(e) => setFormData({ ...formData, bruto: e.target.value })}
                />
                <Input 
                  label="Tara(Kg)" 
                  type="number"
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
                placeholder=""
                disabled
                value={nettoKw.toFixed(2)}
              />
              <Input 
                label="Output Harga" 
                placeholder=""
                disabled
                value={totalHargaDisplay}
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
            className={`w-full py-4 text-sm font-bold bg-[#009262] hover:bg-[#007a52] ${!isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!isFormValid}
            onClick={() => router.push(`/${role}/timbangan?success=true`)}
          >
            Simpan
          </Button>
        </div>
      </div>
    </div>
  );
}
