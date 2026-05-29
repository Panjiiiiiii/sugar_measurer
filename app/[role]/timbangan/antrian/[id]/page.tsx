"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CaretDown } from "@phosphor-icons/react";
import { Card, Input, Select, Button, Breadcrumbs } from "@/components/ui";
import { ReceiptModal } from "@/components/dashboard/ReceiptModal";
import axios from "axios";

export default function AntrianTimbanganDetailPage() {
  const params = useParams();
  const router = useRouter();
  const role = (params.role as string) || "branch";
  const transactionId = params.id as string;

  const [isHargaSpesial, setIsHargaSpesial] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nopol: "N 1234 AC",
    customer: "Abah",
    supir: "Budi",
    masuk: "15:00",
    keluar: "",
    bruto: "100",
    tara: "0",
    harga: "",
    paymentMethod: "cash",
  });
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [data, setData] = useState<any>({});

  useEffect(() => {
    async function fetchTransaction(id: string) {
      try {
        const response = await axios.get(`/api/branch/transaction/${id}`);
        const transaction = response.data.data;
        setData(transaction);
        setIsHargaSpesial(transaction.ownership_type === "special");
        setFormData((current) => ({
          ...current,
          nopol: transaction.lisence_plate ?? current.nopol,
          customer: transaction.owner_name ?? current.customer,
          supir: transaction.driver ?? current.supir,
          masuk: transaction.loading_in ?? current.masuk,
          keluar: transaction.loading_out ?? current.keluar,
          bruto: String(transaction.bruto ?? current.bruto),
          tara: String(transaction.tare ?? current.tara),
          harga: String(transaction.price ?? current.harga),
          paymentMethod: transaction.payment_method ?? current.paymentMethod,
        }));
      } catch (error) {
        console.error("Error fetching transaction data:", error);
      }
    }

    if (transactionId) {
      fetchTransaction(transactionId);
    }
  }, [transactionId]);

  const buildLoadingOutDateTime = (timeValue: string) => {
    const [hours, minutes] = timeValue.split(":");
    const loadingOutDate = new Date();

    loadingOutDate.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);

    return loadingOutDate.toISOString();
  };

  const handleSave = async () => {
    if (!transactionId) return;

    try {
      setIsSaving(true);

      await axios.put(`/api/branch/transaction/out/${transactionId}`, {
        tare: formData.tara,
        loading_out: buildLoadingOutDateTime(formData.keluar),
      });

      router.push(`/${role}/timbangan?success=true`);
    } catch (error) {
      console.error("Error saving transaction out:", error);
    } finally {
      setIsSaving(false);
    }
  };

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

  const brutoVal = parseFloat(formData.bruto) || 0;
  const taraVal = parseFloat(formData.tara) || 0;
  const nettoKw = Math.max(0, brutoVal - taraVal) / 100;
  const hargaVal = parseFloat(formData.harga.replace(/[^0-9]/g, "")) || 0;
  const totalHarga = nettoKw * 100 * hargaVal;
  const totalHargaDisplay = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(totalHarga);

  return (
    <div className="flex flex-col gap-6 w-full max-w-full pb-10">
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Antrian Timbangan</h1>
          </div>
          <Breadcrumbs
            items={[
              { label: "Timbangan", href: `/${role}/timbangan` },
              { label: "Antrian Timbangan", active: true },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card title="Form Timbangan" className="h-full">
            <div className="flex flex-col gap-5">
              <Input label="Input Nopol" required disabled value={formData.nopol} />

              <Input label="Customer" required disabled value={formData.customer} />

              <Input label="Supir" required disabled value={formData.supir} />

              <div className="grid grid-cols-2 gap-4">
                <Input label="Masuk" required type="time" disabled value={formData.masuk} />
                <Input
                  label="Keluar"
                  type="time"
                  value={formData.keluar}
                  onChange={(e) => setFormData({ ...formData, keluar: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Bruto(Kg)" required type="number" disabled value={formData.bruto} />
                <Input
                  label="Tara(Kg)"
                  type="number"
                  value={formData.tara}
                  onChange={(e) => setFormData({ ...formData, tara: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <label className="text-xs font-bold text-gray-600">
                  Harga Spesial <span className="text-red-500">*</span>
                </label>
                <button
                  onClick={() => {
                    if (data?.ownership_type === "special") return;
                    setIsHargaSpesial((cur) => !cur);
                  }}
                  disabled={data?.ownership_type === "special"}
                  className={`w-12 h-6 rounded-full transition-all relative ${isHargaSpesial ? "bg-[#00A3FF]" : "bg-gray-200"} ${data?.ownership_type === "special" ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isHargaSpesial ? "left-7" : "left-1"}`}
                  />
                </button>
              </div>

              <Input label="Harga" required disabled value={String(data?.price ?? "")} />

              <Select
                label="Payment Method"
                required
                disabled
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                icon={<CaretDown size={18} weight="bold" />}
                options={[
                  { value: "cash", label: "Cash" },
                  { value: "transfer", label: "Transfer" },
                ]}
              />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card title="Output Timbangan">
            <div className="flex flex-col gap-5">
              <Input label="Output Netto(kw)" placeholder="" disabled value={nettoKw.toFixed(2)} />
              <Input label="Output Harga" placeholder="" disabled value={totalHargaDisplay} />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <Button variant="white" className="w-full py-4 text-sm font-bold" onClick={() => router.back()}>
            Batal
          </Button>
        </div>
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Button variant="white" className="w-full py-4 text-sm font-bold" onClick={() => setIsReceiptOpen(true)}>
            Print Struk
          </Button>
          <Button
            variant="primary"
            className={`w-full py-4 text-sm font-bold bg-[#009262] hover:bg-[#007a52] ${!isFormValid || isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!isFormValid || isSaving}
            onClick={handleSave}
          >
            {isSaving ? "Menyimpan..." : "Simpan"}
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
          netto: nettoKw.toFixed(2),
          hargaPerKw: hargaVal.toLocaleString("id-ID"),
          total: totalHargaDisplay,
          operator: "Dadang Utama Jaya",
        }}
      />
    </div>
  );
}
