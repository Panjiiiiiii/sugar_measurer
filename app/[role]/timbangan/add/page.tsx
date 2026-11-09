"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import ReactSelect, { type SingleValue } from "react-select";
import { CaretDown, ArrowLeft, ArrowClockwise, LockSimple, LockSimpleOpen } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ReceiptModal } from "@/components/dashboard/ReceiptModal";
import { Toast } from "@/components/ui/Toast";
import { useTheme } from "@/components/ThemeProvider";
import { fetchScaleWeight } from "@/lib/scale";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Truck { id: string; name: string; license_plate: string; }
interface Owner { id: string; name: string; phone_number: string; ownership_type: string; }
interface TruckOption { value: string; label: string; license_plate: string; }
interface OwnerOption { value: string; label: string; name: string; ownership_type?: string | null; special_price?: number | null; }
interface PaginationMeta { per_page: number; number_page: number; total_page: number; total_data: number; }
interface TruckListResponse { statusCode?: number; data: Truck[]; page?: PaginationMeta; }
interface OwnerListResponse { statusCode?: number; data: Owner[]; page?: PaginationMeta; }

interface DraftTimbanganIn {
  draftId: string;
  type: "loading_in";
  payload: Record<string, any>;
  meta: { nopol: string; customer: string; supir: string; };
  savedAt: string;
  status: "draft" | "failed";
}

// ─── Draft helpers ────────────────────────────────────────────────────────────

const DRAFT_KEY = "timbangan_drafts";

function getDrafts(): DraftTimbanganIn[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(DRAFT_KEY) || "[]");
}

function saveDraftIn(payload: Record<string, any>, meta: DraftTimbanganIn["meta"]) {
  const drafts = getDrafts();
  drafts.push({
    draftId: `draft-in-${Date.now()}`,
    type: "loading_in",
    payload,
    meta,
    savedAt: new Date().toISOString(),
    status: "draft",
  });
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildTodayIsoDateTime(time: string): string {
  const [hour, minute] = time.split(":").map((v) => Number.parseInt(v, 10));
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(),
    Number.isNaN(hour) ? 0 : hour, Number.isNaN(minute) ? 0 : minute, 0, 0).toISOString();
}

const getSelectStyles = (theme: string) => {
  const isDark = theme === "dark";
  return {
    control: (base: any, state: any) => ({
      ...base,
      minHeight: "48px",
      borderRadius: "12px",
      borderColor: state.isFocused 
        ? "#3b82f6" 
        : isDark ? "#27272a" : "#e2e8f0",
      boxShadow: state.isFocused ? "0 0 0 4px rgba(59,130,246,0.08)" : "none",
      backgroundColor: state.isDisabled 
        ? (isDark ? "#1c1c1f" : "#f9fafb") 
        : (isDark ? "#0d0d0f" : "#ffffff"),
      cursor: "text",
      "&:hover": {
        borderColor: state.isFocused 
          ? "#3b82f6" 
          : isDark ? "#3f3f46" : "#cbd5e1"
      }
    }),
    placeholder: (base: any) => ({
      ...base,
      color: isDark ? "#71717a" : "#9ca3af"
    }),
    singleValue: (base: any) => ({
      ...base,
      color: isDark ? "#ffffff" : "#111827"
    }),
    input: (base: any) => ({
      ...base,
      color: isDark ? "#ffffff" : "#111827"
    }),
    menu: (base: any) => ({
      ...base,
      borderRadius: "12px",
      overflow: "hidden",
      zIndex: 30,
      backgroundColor: isDark ? "#0c0c0e" : "#ffffff",
      border: isDark ? "1px solid #1f1f23" : "1px solid #f3f4f6"
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? (isDark ? "#2563eb" : "#dbeafe") 
        : state.isFocused 
          ? (isDark ? "#18181c" : "#eff6ff") 
          : (isDark ? "#0c0c0e" : "#ffffff"),
      color: isDark ? "#ffffff" : "#111827",
      cursor: "pointer",
      "&:active": {
        backgroundColor: isDark ? "#2563eb" : "#dbeafe"
      }
    }),
    noOptionsMessage: (base: any) => ({
      ...base,
      color: isDark ? "#71717a" : "#9ca3af",
      backgroundColor: isDark ? "#0c0c0e" : "#ffffff"
    }),
    loadingMessage: (base: any) => ({
      ...base,
      color: isDark ? "#71717a" : "#9ca3af",
      backgroundColor: isDark ? "#0c0c0e" : "#ffffff"
    }),
    clearIndicator: (base: any) => ({
      ...base,
      color: isDark ? "#71717a" : "#94a3b8",
      cursor: "pointer",
      "&:hover": {
        color: isDark ? "#a1a1aa" : "#64748b"
      }
    }),
    dropdownIndicator: (base: any, state: any) => ({
      ...base,
      color: state.isFocused 
        ? "#3b82f6" 
        : isDark ? "#71717a" : "#94a3b8",
      "&:hover": {
        color: "#3b82f6"
      }
    }),
  };
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function InputTimbanganPage() {
  const params = useParams();
  const router = useRouter();
  const role = (params.role as string) || "branch";
  const { theme } = useTheme();
  const selectStyles = React.useMemo(() => getSelectStyles(theme), [theme]);

  const [authUserId, setAuthUserId] = useState("");
  const [authUserName, setAuthUserName] = useState("");
  const [authLocationId, setAuthLocationId] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const [formData, setFormData] = useState({
    nopol: "", customer: "", supir: "", jamMasuk: "", jamKeluar: "",
    bruto: "", tara: "", paymentMethod: "", harga: "",
    isHargaSpesial: false, truck_id: "", owner_id: "",
  });

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
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
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");

  // ── Timbangan (weight scale) fetch state — Bruto & Tara ──────────────────
  const [isBrutoLocked, setIsBrutoLocked] = useState(false);
  const [isTaraLocked, setIsTaraLocked] = useState(false);
  const [isFetchingBruto, setIsFetchingBruto] = useState(false);
  const [isFetchingTara, setIsFetchingTara] = useState(false);

  const resolvedLocationId = authLocationId;
  const resolvedUserId = authUserId;

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    axios.get<{ data?: { id?: string; name?: string; location_id?: string } }>("/api/auth/me")
      .then((res) => {
        const data = res.data?.data;
        if (data?.id) setAuthUserId(data.id);
        if (data?.name) setAuthUserName(data.name);
        if (data?.location_id) setAuthLocationId(data.location_id);
      }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!resolvedLocationId) return;
    axios.get(`/api/location/${resolvedLocationId}`)
      .then((resp) => {
        const data = resp.data?.data;
        if (data && typeof data.sugar_price === "number") {
          setLocationPrice(data.sugar_price);
          setFormData((cur) => ({ ...cur, harga: String(data.sugar_price) }));
        }
      }).catch((err) => console.error("Error fetching location price:", err));
  }, [resolvedLocationId]);

  useEffect(() => {
    if (!isMounted) return;
    const fetchOwners = async () => {
      setIsOwnerLoading(true);
      try {
        const response = await axios.get<OwnerListResponse>("/api/owner", { params: { limit: 100, search: ownerSearchQuery.trim() || undefined } });
        setOwnerOptions((response.data.data ?? []).map((owner) => {
          const ownerTypeLabel = owner.ownership_type === "farmer" ? "Petani" : owner.ownership_type === "private" ? "Pribadi" : owner.ownership_type;
          return { value: owner.id, label: `${owner.name} (${owner.phone_number}) - ${ownerTypeLabel}`, name: owner.name, ownership_type: owner.ownership_type, special_price: (owner as any).special_price ?? null };
        }));
      } catch { setOwnerOptions([]); } finally { setIsOwnerLoading(false); }
    };
    const t = setTimeout(fetchOwners, 300);
    return () => clearTimeout(t);
  }, [isMounted, ownerSearchQuery]);

  useEffect(() => {
    if (!isMounted) return;
    const fetchTrucks = async () => {
      setIsTruckLoading(true);
      try {
        const response = await axios.get<TruckListResponse>("/api/truck", { params: { limit: 100, search: truckSearchQuery.trim() || undefined } });
        setTruckOptions((response.data.data ?? []).map((truck) => ({ value: truck.id, label: `${truck.license_plate} - ${truck.name?.trim() || "Truk tanpa nama"}`, license_plate: truck.license_plate })));
      } catch { setTruckOptions([]); } finally { setIsTruckLoading(false); }
    };
    const t = setTimeout(fetchTrucks, 300);
    return () => clearTimeout(t);
  }, [isMounted, truckSearchQuery]);

  const handleTruckChange = (option: SingleValue<TruckOption>) => {
    setSelectedTruck(option ?? null);
    setFormData((cur) => ({ ...cur, nopol: option?.license_plate ?? "", truck_id: option?.value ?? "" }));
  };

  const handleOwnerChange = (option: SingleValue<OwnerOption>) => {
    setSelectedOwner(option ?? null);
    const owner = option ?? null;
    setFormData((cur) => ({ ...cur, customer: owner?.label ?? "", owner_id: owner?.value ?? "" }));
    if (owner?.ownership_type === "special") {
      const sp = owner.special_price ?? null;
      setFormData((cur) => ({ ...cur, harga: sp !== null ? String(sp) : cur.harga, isHargaSpesial: true }));
    } else if (owner?.ownership_type === "private") {
      setFormData((cur) => ({ ...cur, harga: "0", isHargaSpesial: false }));
    } else {
      setFormData((cur) => ({ ...cur, harga: locationPrice !== null ? String(locationPrice) : cur.harga, isHargaSpesial: false }));
    }
  };

  // ── Tembak API timbangan otomatis begitu halaman selesai mount ───────────
  useEffect(() => {
    if (!isMounted) return;
    let cancelled = false;
    (async () => {
      setIsFetchingBruto(true);
      const { weight, isFallback } = await fetchScaleWeight();
      if (cancelled) return;
      setIsFetchingBruto(false);
      setFormData((cur) => ({ ...cur, bruto: String(weight) }));
      setIsBrutoLocked(!isFallback);
      if (isFallback) {
        showWarningToast("Timbangan tidak terhubung. Berat diisi default 5 Kg, mohon periksa/ubah manual.");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  const handleFetchBruto = async () => {
    // Jika sudah terkunci, tombol berfungsi sebagai unlock untuk ambil ulang / edit manual
    if (isBrutoLocked) {
      setIsBrutoLocked(false);
      return;
    }
    setIsFetchingBruto(true);
    const { weight, isFallback } = await fetchScaleWeight();
    setIsFetchingBruto(false);
    setFormData((cur) => ({ ...cur, bruto: String(weight) }));
    setIsBrutoLocked(!isFallback);
    if (isFallback) {
      showWarningToast("Timbangan tidak terhubung. Berat diisi default 5 Kg, mohon periksa/ubah manual.");
    }
  };

  const handleFetchTara = async () => {
    if (isTaraLocked) {
      setIsTaraLocked(false);
      return;
    }
    setIsFetchingTara(true);
    const { weight, isFallback } = await fetchScaleWeight();
    setIsFetchingTara(false);
    setFormData((cur) => ({ ...cur, tara: String(weight) }));
    setIsTaraLocked(!isFallback);
    if (isFallback) {
      showWarningToast("Timbangan tidak terhubung. Berat diisi default 5 Kg, mohon periksa/ubah manual.");
    }
  };

  const isFormValid = !!formData.nopol && !!formData.customer && !!formData.supir && !!formData.jamMasuk && !!formData.bruto && !!formData.paymentMethod && !!formData.truck_id && !!formData.owner_id;

  const showErrorToast = (message: string) => { setToastType("error"); setToastMessage(message); setShowToast(true); };
  const showWarningToast = (message: string) => { setToastType("warning"); setToastMessage(message); setShowToast(true); };

  const handleSubmit = async () => {
    if (!formData.truck_id) { showErrorToast("Silakan pilih truk terlebih dahulu"); return; }
    if (!formData.owner_id) { showErrorToast("Silakan pilih customer terlebih dahulu"); return; }
    if (!resolvedLocationId) { showErrorToast("Location tidak ditemukan. Silakan login ulang"); return; }
    if (!resolvedUserId) { showErrorToast("User tidak ditemukan. Silakan login ulang"); return; }

    const brutoWeight = Number.parseInt(formData.bruto, 10);
    const taraWeight = formData.tara ? Number.parseInt(formData.tara, 10) : undefined;
    const sugarPrice = Number.parseInt(formData.harga.replace(/[^0-9]/g, ""), 10);

    if (Number.isNaN(brutoWeight)) { showErrorToast("Berat bruto harus berupa angka yang valid"); return; }
    if (taraWeight !== undefined && Number.isNaN(taraWeight)) { showErrorToast("Berat tara harus berupa angka yang valid"); return; }

    const payload = {
      bruto_weight: brutoWeight,
      tarra_weight: taraWeight,
      loading_in: buildTodayIsoDateTime(formData.jamMasuk),
      loading_out: formData.jamKeluar ? buildTodayIsoDateTime(formData.jamKeluar) : undefined,
      truck_id: formData.truck_id,
      location_id: resolvedLocationId,
      user_id: resolvedUserId,
      owner_id: formData.owner_id,
      payment_method: formData.paymentMethod,
      driver_name: formData.supir.trim() || undefined,
      sugar_price: Number.isNaN(sugarPrice) ? undefined : sugarPrice,
    };

    try {
      setIsSubmitting(true);
      const response = await axios.post("/api/branch/transaction/in", payload);
      setToastType("success");
      setToastMessage(response.data?.message || "Transaksi berhasil dibuat");
      setShowToast(true);
      const nextParams = new URLSearchParams();
      if (resolvedLocationId) nextParams.set("location_id", resolvedLocationId);
      nextParams.set("success", "true");
      setTimeout(() => router.push(`/${role}/timbangan?${nextParams.toString()}`), 600);
    } catch (error) {
      // API gagal → simpan draft
      saveDraftIn(payload, {
        nopol: formData.nopol,
        customer: selectedOwner?.name || formData.customer,
        supir: formData.supir,
      });
      setToastType("warning");
      setToastMessage("Gagal menyimpan. Data disimpan sebagai draft.");
      setShowToast(true);
      setTimeout(() => router.push(`/${role}/timbangan?draft=true`), 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  const brutoVal = parseFloat(formData.bruto) || 0;
  const taraVal = parseFloat(formData.tara) || 0;
  const nettoKw = Math.max(0, brutoVal - taraVal) / 100;
  const hargaVal = parseFloat(formData.harga.replace(/[^0-9]/g, "")) || 0;
  const totalHarga = nettoKw * 100 * hargaVal;
  const totalHargaDisplay = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalHarga);

  const receiptData = {
    customer: selectedOwner?.name || formData.customer,
    nopol: selectedTruck?.license_plate || formData.nopol,
    masuk: formData.jamMasuk, keluar: formData.jamKeluar,
    bruto: formData.bruto, tara: formData.tara,
    netto: nettoKw.toFixed(2), hargaPerKw: hargaVal.toLocaleString("id-ID"),
    total: totalHargaDisplay, operator: authUserName || "-",
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full pb-10">
      <Toast isVisible={showToast} onClose={() => setShowToast(false)} type={toastType} message={toastMessage} />

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="white" size="sm" onClick={() => router.back()} className="p-2" icon={<ArrowLeft size={18} weight="bold" className="text-gray-600" />}>{null}</Button>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Input Timbangan</h1>
          </div>
          <Breadcrumbs items={[{ label: "Timbangan", href: `/${role}/timbangan` }, { label: "Input Timbangan", active: true }]} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card title="Form Timbangan">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2 w-full">
                <label className="text-xs font-bold text-gray-600">Input Nopol <span className="text-red-500">*</span></label>
                {isMounted ? (
                  <ReactSelect isClearable isSearchable isLoading={isTruckLoading} placeholder="Cari nopol atau nama truck" value={selectedTruck} onChange={handleTruckChange} onInputChange={setTruckSearchQuery} inputValue={truckSearchQuery} options={truckOptions} styles={selectStyles} noOptionsMessage={() => isTruckLoading ? "Memuat data truk..." : truckSearchQuery ? "Truk tidak ditemukan" : "Ketik untuk mencari truk"} />
                ) : (<Input placeholder="Memuat data truk..." disabled />)}
              </div>

              <div className="flex flex-col gap-2 w-full">
                <label className="text-xs font-bold text-gray-600">Customer <span className="text-red-500">*</span></label>
                {isMounted ? (
                  <ReactSelect isClearable isSearchable isLoading={isOwnerLoading} placeholder="Cari nama atau nomor customer" value={selectedOwner} onChange={handleOwnerChange} onInputChange={setOwnerSearchQuery} inputValue={ownerSearchQuery} options={ownerOptions} styles={selectStyles} noOptionsMessage={() => isOwnerLoading ? "Memuat data customer..." : ownerSearchQuery ? "Customer tidak ditemukan" : "Ketik untuk mencari customer"} />
                ) : (<Input placeholder="Memuat data customer..." disabled />)}
              </div>

              <Input label="Supir" required placeholder="Masukkan Nama Supir" value={formData.supir} onChange={(e) => setFormData({ ...formData, supir: e.target.value })} />

              <div className="grid grid-cols-2 gap-4">
                <Input label="Masuk" required type="time" placeholder="00:00" value={formData.jamMasuk} onChange={(e) => setFormData({ ...formData, jamMasuk: e.target.value })} />
                <Input label="Keluar" type="time" placeholder="00:00" value={formData.jamKeluar} onChange={(e) => setFormData({ ...formData, jamKeluar: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Bruto — dengan tombol ambil dari timbangan */}
                <div className="flex flex-col gap-2 w-full">
                  <label className="text-xs font-bold text-gray-600">Bruto(Kg) <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-2">
                    <Input
                      required
                      type="number"
                      placeholder="0"
                      value={formData.bruto}
                      disabled={isBrutoLocked}
                      readOnly={isBrutoLocked}
                      onChange={(e) => setFormData({ ...formData, bruto: e.target.value })}
                      className={`flex-1 ${isBrutoLocked ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="white"
                      size="sm"
                      onClick={handleFetchBruto}
                      disabled={isFetchingBruto}
                      title={isBrutoLocked ? "Buka kunci untuk ubah manual" : "Ambil berat dari timbangan"}
                      className="p-2 shrink-0"
                      icon={
                        isFetchingBruto ? (
                          <ArrowClockwise size={18} className="animate-spin text-gray-500" />
                        ) : isBrutoLocked ? (
                          <LockSimple size={18} weight="bold" className="text-[#00A3FF]" />
                        ) : (
                          <LockSimpleOpen size={18} weight="bold" className="text-gray-600" />
                        )
                      }
                    >
                      {null}
                    </Button>
                  </div>
                </div>

                {/* Tara — dengan tombol ambil dari timbangan */}
                <div className="flex flex-col gap-2 w-full">
                  <label className="text-xs font-bold text-gray-600">Tara(Kg)</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.tara}
                      disabled={isTaraLocked}
                      readOnly={isTaraLocked}
                      onChange={(e) => setFormData({ ...formData, tara: e.target.value })}
                      className={`flex-1 ${isTaraLocked ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="white"
                      size="sm"
                      onClick={handleFetchTara}
                      disabled={isFetchingTara}
                      title={isTaraLocked ? "Buka kunci untuk ubah manual" : "Ambil berat dari timbangan"}
                      className="p-2 shrink-0"
                      icon={
                        isFetchingTara ? (
                          <ArrowClockwise size={18} className="animate-spin text-gray-500" />
                        ) : isTaraLocked ? (
                          <LockSimple size={18} weight="bold" className="text-[#00A3FF]" />
                        ) : (
                          <LockSimpleOpen size={18} weight="bold" className="text-gray-600" />
                        )
                      }
                    >
                      {null}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <label className="text-xs font-bold text-gray-600">Harga Spesial <span className="text-red-500">*</span></label>
                <button onClick={() => { if (selectedOwner?.ownership_type === "special") return; setFormData((cur) => ({ ...cur, isHargaSpesial: !cur.isHargaSpesial })); }} disabled={selectedOwner?.ownership_type === "special"} className={`w-12 h-6 rounded-full transition-all relative ${formData.isHargaSpesial ? "bg-[#00A3FF]" : "bg-gray-200"} ${selectedOwner?.ownership_type === "special" ? "opacity-60 cursor-not-allowed" : ""}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isHargaSpesial ? "left-7" : "left-1"}`} />
                </button>
              </div>

              <Input label="Harga" required value={formData.harga} onChange={(e) => setFormData({ ...formData, harga: e.target.value })} disabled={formData.isHargaSpesial} placeholder="0" className={formData.isHargaSpesial ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""} />

              <Select label="Metode Pembayaran" required icon={<CaretDown size={18} />} value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} options={[{ value: "", label: "Pilih Metode" }, { value: "cash", label: "Cash" }, { value: "transfer", label: "Transfer" }]} />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card title="Output Timbangan">
            <div className="flex flex-col gap-6">
              <Input label="Output Netto(kw)" disabled placeholder="0" value={nettoKw.toFixed(2)} />
              <Input label="Output Harga" disabled placeholder="Rp 0" value={totalHargaDisplay} />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <Button variant="white" className="w-full py-4" onClick={() => router.back()}>Batal</Button>
        </div>
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Button variant="white" className="w-full py-4" onClick={() => setIsReceiptOpen(true)}>Print Struk</Button>
          <Button variant="primary" className={`w-full py-4 ${!isFormValid || isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`} disabled={!isFormValid || isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      <ReceiptModal isOpen={isReceiptOpen} onClose={() => setIsReceiptOpen(false)} data={receiptData} />
    </div>
  );
}