"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Clock, 
  CaretDown,
  ArrowLeft
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function InputTimbanganPage() {
  const params = useParams();
  const router = useRouter();
  const role = (params.role as string) || "branch";
  
  const [isHargaSpesial, setIsHargaSpesial] = useState(false);
  const [harga, setHarga] = useState("Rp 7.500");

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
            >
              {null}
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Input Timbangan</h1>
          </div>
          <Breadcrumbs 
            items={[
              { label: "Timbangan", href: `/${role}/timbangan` },
              { label: "Input Timbangan", active: true }
            ]} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card title="Form Timbangan">
            <div className="flex flex-col gap-6">
              <Input 
                label="Input Nopol" 
                required 
                placeholder="Masukkan Nomor Polisi" 
              />
              
              <Input 
                label="Customer" 
                required 
                placeholder="Pilih Customer" 
                icon={<CaretDown size={18} />}
              />

              <Input 
                label="Supir" 
                required 
                placeholder="Masukkan Nama Supir" 
              />

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Masuk" 
                  required 
                  placeholder="00:00" 
                  icon={<Clock size={18} weight="bold" />}
                />
                <Input 
                  label="Keluar" 
                  placeholder="00:00" 
                  icon={<Clock size={18} weight="bold" />}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Bruto(Kg)" 
                  required 
                  type="number" 
                  placeholder="0" 
                />
                <Input 
                  label="Tara(Kg)" 
                  type="number" 
                  placeholder="0" 
                />
              </div>

              {/* Harga Spesial Toggle */}
              <div className="flex items-center justify-between py-2">
                <label className="text-xs font-bold text-gray-600">
                  Harga Spesial <span className="text-red-500">*</span>
                </label>
                <button 
                  onClick={() => setIsHargaSpesial(!isHargaSpesial)}
                  className={`w-12 h-6 rounded-full transition-all relative ${isHargaSpesial ? 'bg-[#00A3FF]' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isHargaSpesial ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <Input 
                label="Harga" 
                required 
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
                disabled={!isHargaSpesial}
                placeholder="Rp 0"
                className={!isHargaSpesial ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""}
              />

              <Select 
                label="Payment Method" 
                required 
                placeholder="Pilih Metode Pembayaran"
                icon={<CaretDown size={18} />}
                options={[
                  { value: "cash", label: "Cash" },
                  { value: "transfer", label: "Transfer" }
                ]}
              />
            </div>
          </Card>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card title="Output Timbangan">
            <div className="flex flex-col gap-6">
              <Input 
                label="Output Netto(kw)" 
                disabled 
                placeholder="0" 
              />
              <Input 
                label="Output Harga" 
                disabled 
                placeholder="Rp 0" 
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
            className="w-full py-4" 
            onClick={() => router.back()}
          >
            Batal
          </Button>
        </div>
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Button variant="white" className="w-full py-4">
            Print Struk
          </Button>
          <Button variant="primary" className="w-full py-4">
            Simpan
          </Button>
        </div>
      </div>
    </div>
  );
}
