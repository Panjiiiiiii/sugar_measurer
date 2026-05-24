"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import ReactSelect, { type SingleValue } from "react-select";
import {
  CaretDown,
  ArrowLeft
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ReceiptModal } from "@/components/dashboard/ReceiptModal";
import { Toast } from "@/components/ui/Toast";
import { payment_method } from "@/generated/prisma/enums";

interface Truck {
  id: string;
  name: string;
  license_plate: string;
}

interface Owner {
  id: string;
  name: string;
  phone_number: string;
  ownership_type: string;
}

interface TruckOption {
  value: string;
  label: string;
  license_plate: string;
}

interface OwnerOption {
  value: string;
  label: string;
  ownership_type?: string | null;
  special_price?: number | null;
}

interface PaginationMeta {
  per_page: number;
  number_page: number;
  total_page: number;
  total_data: number;
}

interface TruckListResponse {
  statusCode?: number;
  data: Truck[];
  page?: PaginationMeta;
}

interface OwnerListResponse {
  statusCode?: number;
  data: Owner[];
  page?: PaginationMeta;
}

interface LoginPayload {
  sub?: string;
  location_id?: string;
}

function decodeJwtPayload(token: string): LoginPayload | null {
  const tokenParts = token.split(".");
  if (tokenParts.length < 2) return null;

  try {
    const base64 = tokenParts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = atob(padded);
    return JSON.parse(json) as LoginPayload;
  } catch {
    return null;
  }
}

function getStoredToken(): string | null {
  const candidateKeys = ["token", "auth_token", "access_token", "authToken"];

  for (const key of candidateKeys) {
    const value = localStorage.getItem(key) ?? sessionStorage.getItem(key);
    if (!value) continue;

    try {
      const parsed = JSON.parse(value) as { token?: string };
      if (parsed?.token && typeof parsed.token === "string") {
        return parsed.token;
      }
    } catch {
      if (typeof value === "string" && value.includes(".")) {
        return value;
      }
    }
  }

  return null;
}

function buildTodayIsoDateTime(time: string): string {
  const [hour, minute] = time.split(":").map((val) => Number.parseInt(val, 10));
  const now = new Date();
  const composed = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    Number.isNaN(hour) ? 0 : hour,
    Number.isNaN(minute) ? 0 : minute,
    0,
    0,
  );

  return composed.toISOString();
}

const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: "48px",
    borderRadius: "12px",
    borderColor: state.isFocused ? "#3b82f6" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 4px rgba(59, 130, 246, 0.08)" : "none",
    backgroundColor: state.isDisabled ? "#f9fafb" : "#ffffff",
    cursor: "text",
    "&:hover": {
      borderColor: state.isFocused ? "#3b82f6" : "#cbd5e1",
    },
  }),
  placeholder: (base: any) => ({
    ...base,
    color: "#9ca3af",
  }),
  singleValue: (base: any) => ({
    ...base,
    color: "#111827",
  }),
  input: (base: any) => ({
    ...base,
    color: "#111827",
  }),
  menu: (base: any) => ({
    ...base,
    borderRadius: "12px",
    overflow: "hidden",
    zIndex: 30,
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#dbeafe"
      : state.isFocused
        ? "#eff6ff"
        : "#ffffff",
    color: "#111827",
    cursor: "pointer",
  }),
  clearIndicator: (base: any) => ({
    ...base,
    color: "#94a3b8",
    cursor: "pointer",
    "&:hover": {
      color: "#64748b",
    },
  }),
  dropdownIndicator: (base: any, state: any) => ({
    ...base,
    color: state.isFocused ? "#3b82f6" : "#94a3b8",
    "&:hover": {
      color: "#3b82f6",
    },
  }),
};

export default function InputTimbanganPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (params.role as string) || "branch";
  
  const [formData, setFormData] = useState({
    nopol: "",
    customer: "",
    supir: "",
    jamMasuk: "",
    jamKeluar: "",
    bruto: "",
    tara: "",
    paymentMethod: "",
    harga: "7500",
    isHargaSpesial: false,
    truck_id: "",
    owner_id: "",
    user_id: "",
    location_id: "",
  });

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [truckOptions, setTruckOptions] = useState<TruckOption[]>([]);
  const [selectedTruck, setSelectedTruck] = useState<TruckOption | null>(null);
  const [isTruckLoading, setIsTruckLoading] = useState(false);
  const [truckSearchQuery, setTruckSearchQuery] = useState("");
  const [ownerOptions, setOwnerOptions] = useState<OwnerOption[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<OwnerOption | null>(null);
  const [isOwnerLoading, setIsOwnerLoading] = useState(false);
  const [ownerSearchQuery, setOwnerSearchQuery] = useState("");
  const [locationPrice, setLocationPrice] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const DEFAULT_BRANCH_LOCATION_ID = "07bf151f-ed44-4a5d-96cb-afed7e087c7a";
  const DEFAULT_BRANCH_USER_ID = "8345ff68-0aa6-4e76-bac5-ec14d782938f";
  const queryLocationId = searchParams.get("location_id") || "";
  const queryUserId = searchParams.get("user_id") || "";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const token = getStoredToken();
    const payload = token ? decodeJwtPayload(token) : null;

    setFormData((current) => ({
      ...current,
      user_id: queryUserId || payload?.sub || current.user_id,
      location_id:
        queryLocationId ||
        payload?.location_id ||
        current.location_id ||
        DEFAULT_BRANCH_LOCATION_ID,
    }));
  }, [isMounted, queryLocationId, queryUserId]);

  useEffect(() => {
    if (!isMounted) return;

    const fetchLocation = async () => {
      try {
        const locationId = queryLocationId || formData.location_id || DEFAULT_BRANCH_LOCATION_ID;
        const resp = await axios.get(`/api/location/${locationId}`);
        const data = resp.data?.data;
        if (data && typeof data.sugar_price === "number") {
          setLocationPrice(data.sugar_price);
          // if no owner special selected, set harga to location price
          setFormData((cur) => ({ ...cur, harga: String(data.sugar_price ?? cur.harga) }));
        }
      } catch (err) {
        console.error("Error fetching location price:", err);
      }
    };

    

    fetchLocation();
  }, [isMounted, queryLocationId, formData.location_id]);

  useEffect(() => {
    if (!isMounted) return;

    const fetchOwners = async () => {
      setIsOwnerLoading(true);

      try {
        const response = await axios.get<OwnerListResponse>("/api/owner", {
          params: {
            limit: 100,
            search: ownerSearchQuery.trim() || undefined,
          },
        });

        const options = (response.data.data ?? []).map((owner) => {
          const ownerTypeLabel = owner.ownership_type === "farmer"
            ? "Petani"
            : owner.ownership_type === "private"
              ? "Pribadi"
              : owner.ownership_type;

          return {
            value: owner.id,
            label: `${owner.name} (${owner.phone_number}) - ${ownerTypeLabel}`,
            ownership_type: owner.ownership_type,
            special_price: (owner as any).special_price ?? null,
          } as OwnerOption;
        });

        setOwnerOptions(options);
      } catch (error) {
        console.error("Error fetching owner options:", error);
        setOwnerOptions([]);
      } finally {
        setIsOwnerLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchOwners();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [isMounted, ownerSearchQuery]);

  useEffect(() => {
    if (!isMounted) return;

    const fetchTrucks = async () => {
      setIsTruckLoading(true);

      try {
        const response = await axios.get<TruckListResponse>("/api/truck", {
          params: {
            limit: 100,
            search: truckSearchQuery.trim() || undefined,
          },
        });

        const options = (response.data.data ?? []).map((truck) => {
          const truckName = truck.name?.trim() || "Truk tanpa nama";

          return {
            value: truck.id,
            label: `${truck.license_plate} - ${truckName}`,
            license_plate: truck.license_plate,
          };
        });

        setTruckOptions(options);
      } catch (error) {
        console.error("Error fetching truck options:", error);
        setTruckOptions([]);
      } finally {
        setIsTruckLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchTrucks();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [isMounted, truckSearchQuery]);

  const handleTruckChange = (option: SingleValue<TruckOption>) => {
    setSelectedTruck(option ?? null);
    setFormData((current) => ({
      ...current,
      nopol: option?.license_plate ?? "",
      truck_id: option?.value ?? "",
    }));
  };

  const handleOwnerChange = (option: SingleValue<OwnerOption>) => {
    setSelectedOwner(option ?? null);
    const owner = option ?? null;
    setFormData((current) => ({
      ...current,
      customer: owner?.label ?? "",
      owner_id: owner?.value ?? "",
    }));

    // special owner: enable special price, set harga to owner's special_price and disable editing
    if (owner?.ownership_type === "special") {
      const sp = owner.special_price ?? null;
      setFormData((cur) => ({ ...cur, harga: sp !== null ? String(sp) : cur.harga, isHargaSpesial: true }));
    } else {
      // farmer or private: default harga to zero and allow manual edit
      setFormData((cur) => ({ ...cur, harga: "0", isHargaSpesial: false }));
    }
  };

  const isFormValid = 
    !!formData.nopol && 
    !!formData.customer && 
    !!formData.supir && 
    !!formData.jamMasuk && 
    !!formData.bruto && 
    !!formData.paymentMethod && 
    !!formData.truck_id &&
    !!formData.owner_id;

  const showErrorToast = (message: string) => {
    setToastType("error");
    setToastMessage(message);
    setShowToast(true);
  };

  const handleSubmit = async () => {
    if (!formData.truck_id) {
      showErrorToast("Silakan pilih truk terlebih dahulu");
      return;
    }

    if (!formData.owner_id) {
      showErrorToast("Silakan pilih customer terlebih dahulu");
      return;
    }

    // if (!formData.user_id) {
    //   showErrorToast("User tidak ditemukan. Silakan login ulang");
    //   return;
    // }

    const brutoWeight = Number.parseInt(formData.bruto, 10);
    const taraWeight = formData.tara ? Number.parseInt(formData.tara, 10) : undefined;
    const sugarPrice = Number.parseInt(formData.harga.replace(/[^0-9]/g, ""), 10);

    if (Number.isNaN(brutoWeight)) {
      showErrorToast("Berat bruto harus berupa angka yang valid");
      return;
    }

    if (taraWeight !== undefined && Number.isNaN(taraWeight)) {
      showErrorToast("Berat tara harus berupa angka yang valid");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        bruto_weight: brutoWeight,
        tarra_weight: taraWeight,
        loading_in: buildTodayIsoDateTime(formData.jamMasuk),
        loading_out: formData.jamKeluar
          ? buildTodayIsoDateTime(formData.jamKeluar)
          : undefined,
        truck_id: formData.truck_id,
        location_id: formData.location_id || queryLocationId || DEFAULT_BRANCH_LOCATION_ID,
        user_id: formData.user_id || queryUserId || DEFAULT_BRANCH_USER_ID,
        owner_id: formData.owner_id,
        payment_method: formData.paymentMethod,
        driver_name: formData.supir.trim() || undefined,
        sugar_price: Number.isNaN(sugarPrice) ? undefined : sugarPrice,
      };

      const response = await axios.post("/api/branch/transaction/in", payload);

      setToastType("success");
      setToastMessage(response.data?.message || "Transaksi berhasil dibuat");
      setShowToast(true);

      const nextParams = new URLSearchParams();
      if (formData.location_id) {
        nextParams.set("location_id", formData.location_id);
      }
      nextParams.set("success", "true");

      setTimeout(() => {
        router.push(`/${role}/timbangan?${nextParams.toString()}`);
      }, 600);
    } catch (error) {
      const apiMessage =
        axios.isAxiosError(error)
          ? (error.response?.data?.message as string | undefined)
          : undefined;

      showErrorToast(apiMessage || "Gagal menyimpan transaksi");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <Toast
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
        message={toastMessage}
      />

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
              <div className="flex flex-col gap-2 w-full">
                <label className="text-xs font-bold text-gray-600">
                  Input Nopol <span className="text-red-500">*</span>
                </label>
                {isMounted ? (
                  <ReactSelect
                    isClearable
                    isSearchable
                    isLoading={isTruckLoading}
                    placeholder="Cari nopol atau nama truck"
                    value={selectedTruck}
                    onChange={handleTruckChange}
                    onInputChange={setTruckSearchQuery}
                    inputValue={truckSearchQuery}
                    options={truckOptions}
                    styles={selectStyles}
                    noOptionsMessage={() => (isTruckLoading ? "Memuat data truk..." : truckSearchQuery ? "Truk tidak ditemukan" : "Ketik untuk mencari truk")}
                  />
                ) : (
                  <Input
                    placeholder="Memuat data truk..."
                    disabled
                  />
                )}
              </div>
              
              <div className="flex flex-col gap-2 w-full">
                <label className="text-xs font-bold text-gray-600">
                  Customer <span className="text-red-500">*</span>
                </label>
                {isMounted ? (
                  <ReactSelect
                    isClearable
                    isSearchable
                    isLoading={isOwnerLoading}
                    placeholder="Cari nama atau nomor customer"
                    value={selectedOwner}
                    onChange={handleOwnerChange}
                    onInputChange={setOwnerSearchQuery}
                    inputValue={ownerSearchQuery}
                    options={ownerOptions}
                    styles={selectStyles}
                    noOptionsMessage={() => (isOwnerLoading ? "Memuat data customer..." : ownerSearchQuery ? "Customer tidak ditemukan" : "Ketik untuk mencari customer")}
                  />
                ) : (
                  <Input
                    placeholder="Memuat data customer..."
                    disabled
                  />
                )}
              </div>

              <Input 
                label="Supir" 
                required 
                placeholder="Masukkan Nama Supir" 
                value={formData.supir}
                onChange={(e) => setFormData({ ...formData, supir: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Masuk" 
                  required 
                  type="time"
                  placeholder="00:00" 
                  value={formData.jamMasuk}
                  onChange={(e) => setFormData({ ...formData, jamMasuk: e.target.value })}
                />
                <Input 
                  label="Keluar" 
                  type="time"
                  placeholder="00:00" 
                  value={formData.jamKeluar}
                  onChange={(e) => setFormData({ ...formData, jamKeluar: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Bruto(Kg)" 
                  required 
                  type="number" 
                  placeholder="0" 
                  value={formData.bruto}
                  onChange={(e) => setFormData({ ...formData, bruto: e.target.value })}
                />
                <Input 
                  label="Tara(Kg)" 
                  type="number" 
                  placeholder="0" 
                  value={formData.tara}
                  onChange={(e) => setFormData({ ...formData, tara: e.target.value })}
                />
              </div>

              {/* Harga Spesial Toggle */}
              <div className="flex items-center justify-between py-2">
                <label className="text-xs font-bold text-gray-600">
                  Harga Spesial <span className="text-red-500">*</span>
                </label>
                <button
                  onClick={() => {
                    // prevent toggling when owner has forced special price
                    if (selectedOwner?.ownership_type === "special") return;
                    setFormData((cur) => ({ ...cur, isHargaSpesial: !cur.isHargaSpesial }));
                  }}
                  disabled={selectedOwner?.ownership_type === "special"}
                  className={`w-12 h-6 rounded-full transition-all relative ${formData.isHargaSpesial ? 'bg-[#00A3FF]' : 'bg-gray-200'} ${selectedOwner?.ownership_type === "special" ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isHargaSpesial ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <Input 
                label="Harga" 
                required 
                value={formData.harga}
                onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                disabled={formData.isHargaSpesial}
                placeholder="0"
                className={formData.isHargaSpesial ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""}
              />

              <Select 
                label="Metode Pembayaran" 
                required 
                icon={<CaretDown size={18} />}
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                options={[
                  { value : "", label : "Pilih Metode"},
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
                value={nettoKw.toFixed(2)}
              />
              <Input 
                label="Output Harga" 
                disabled 
                placeholder="Rp 0" 
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
            className="w-full py-4" 
            onClick={() => router.back()}
          >
            Batal
          </Button>
        </div>
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Button 
            variant="white" 
            className="w-full py-4"
            onClick={() => setIsReceiptOpen(true)}
          >
            Print Struk
          </Button>
          <Button 
            variant="primary" 
            className={`w-full py-4 ${!isFormValid || isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!isFormValid || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      <ReceiptModal 
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        data={{
          customer: formData.customer,
          nopol: formData.nopol,
          masuk: formData.jamMasuk,
          keluar: formData.jamKeluar,
          bruto: formData.bruto,
          tara: formData.tara,
          netto: nettoKw.toFixed(2),
          hargaPerKw: (hargaVal).toLocaleString("id-ID"),
          total: totalHargaDisplay,
          operator: "Dadang Utama Jaya"
        }}
      />
    </div>
  );
}
