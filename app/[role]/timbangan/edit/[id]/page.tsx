"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
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
  Breadcrumbs
} from "@/components/ui";
import { ReceiptModal } from "@/components/dashboard/ReceiptModal";

interface TransactionDetailResponse {
  statusCode: number;
  data?: {
    id: string;
    loading_in: string;
    loading_out: string | null;
    bruto: number;
    tare: number;
    netto: number;
    current_price: number;
    total_price: number;
    payment_method: string;
    driver_name: string;
    license_plate: string;
    owner_name: string | null;
    ownership_type: string | null;
  };
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function normalizeTime(value: string | null | undefined) {
  if (!value) return "";
  return value.length >= 5 ? value.slice(0, 5) : value;
}

export default function EditTimbanganPage() {
  const params = useParams();
  const router = useRouter();
  const role = (params.role as string) || "branch";
  const transactionId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [formData, setFormData] = useState({
    nopol: "",
    customer: "",
    supir: "",
    masuk: "",
    keluar: "",
    bruto: "",
    tara: "",
    harga: "",
    paymentMethod: "cash",
    netto: "",
    outputHarga: "",
    isHargaSpesial: false,
  });

  useEffect(() => {
    async function fetchTransaction(id: string) {
      try {
        setIsLoading(true);

        const response = await axios.get<TransactionDetailResponse>(`/api/history/transaction/${id}`);
        const transaction = response.data?.data;

        if (!transaction) {
          return;
        }

        setFormData({
          nopol: transaction.license_plate ?? "",
          customer: transaction.owner_name ?? "",
          supir: transaction.driver_name ?? "",
          masuk: normalizeTime(transaction.loading_in),
          keluar: normalizeTime(transaction.loading_out),
          bruto: String(transaction.bruto ?? ""),
          tara: String(transaction.tare ?? ""),
          harga: String(transaction.current_price ?? ""),
          paymentMethod: (transaction.payment_method || "cash").toLowerCase(),
          netto: ((transaction.netto || 0) / 100).toFixed(2),
          outputHarga: formatRupiah(transaction.total_price || 0),
          isHargaSpesial: transaction.ownership_type === "special",
        });
      } catch (error) {
        console.error("Error fetching transaction detail:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (transactionId) {
      fetchTransaction(transactionId);
    }
  }, [transactionId]);

  const hargaPerKw = Number(formData.harga || 0).toLocaleString("id-ID");

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
              Detail Timbangan
            </h1>
          </div>
          <Breadcrumbs 
            items={[
              { label: "Timbangan", href: `/${role}/timbangan` },
              { label: "Detail Timbangan", active: true }
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
                disabled
              />
              
              <Input 
                label="Customer" 
                required 
                value={formData.customer}
                disabled
              />

              <Input 
                label="Supir" 
                required 
                value={formData.supir}
                disabled
              />

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Masuk" 
                  required 
                  value={formData.masuk}
                  disabled
                  icon={<Clock size={20} className="text-gray-400" />}
                />
                <Input 
                  label="Keluar" 
                  value={formData.keluar}
                  disabled
                  icon={<Clock size={20} className="text-gray-400" />}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Bruto(Kg)" 
                  required 
                  value={formData.bruto}
                  disabled
                />
                <Input 
                  label="Tara(Kg)" 
                  value={formData.tara}
                  disabled
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <label className="text-xs font-bold text-gray-600">
                  Harga Spesial
                </label>
                <button
                  type="button"
                  disabled
                  className={`w-12 h-6 rounded-full transition-all relative cursor-not-allowed ${formData.isHargaSpesial ? "bg-[#00A3FF]" : "bg-gray-200"}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isHargaSpesial ? "left-7" : "left-1"}`}
                  />
                </button>
              </div>

              <Input 
                label="Harga" 
                required 
                disabled
                value={formData.harga}
              />

              <Select 
                label="Payment Method" 
                required 
                disabled
                value={formData.paymentMethod}
                icon={<CaretDown size={18} weight="bold" />}
                options={[
                  { value: "cash", label: "Cash" },
                  { value: "transfer", label: "Transfer" }
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
                disabled
              />
              <Input 
                label="Output Harga" 
                value={formData.outputHarga}
                disabled
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
            onClick={() => setIsReceiptOpen(true)}
            disabled={isLoading}
          >
            Print Struk
          </Button>
          <Button 
            variant="primary" 
            className="w-full py-4 text-sm font-bold bg-[#009262] hover:bg-[#007a52]"
            disabled
          >
            Mode Detail
          </Button>
        </div>
      </div>

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        data={{
          customer: formData.customer,
          nopol: formData.nopol,
          masuk: formData.masuk,
          keluar: formData.keluar,
          bruto: formData.bruto,
          tara: formData.tara,
          netto: formData.netto,
          hargaPerKw,
          total: formData.outputHarga,
          operator: "SYSTEM",
        }}
      />
    </div>
  );
}
