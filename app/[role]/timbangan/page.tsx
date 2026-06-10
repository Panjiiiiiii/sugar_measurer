"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";
import axios from "@/lib/axios";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AntrianTable } from "@/components/dashboard/AntrianTable";
import { RiwayatTimbanganTable } from "@/components/dashboard/RiwayatTimbanganTable";
import { StatCard } from "@/components/ui/StatCard";
import { DeleteModal, Toast } from "@/components/ui";
import { Export, CloudSlash, ArrowClockwise, Trash } from "@phosphor-icons/react";
import TimbanganFilterModal from "@/components/dashboard/TimbanganFilterModal";
import { Card } from "@/components/ui/Card";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiAntrianItem {
  id: string; tanggal_transaksi: string; loading_in: string;
  no_pol_truck: string; nama_driver: string; type_ownership: string | null;
  nama_petani: string; bruto: number;
}

interface ApiRiwayatItem {
  id: string; tanggal_transaksi: string; loading_in: string; loading_out: string;
  no_pol_truck: string; nama_driver: string; type_ownership: string | null;
  nama_petani: string; bruto: number; tara: number; netto: number;
  amount: number; payment_method: string; status: "paid" | "unpaid";
}

interface TimbanganHistoryResponse {
  statusCode: number;
  kpi: { paid: number; unpaid: number; inqueue: number; };
  data: { inQueue: ApiAntrianItem[]; history: ApiRiwayatItem[]; };
  page?: { number_page: number; total_page: number; total_data: number; per_page: number; };
}

interface DraftTimbangan {
  draftId: string;
  type: "loading_in" | "loading_out";
  transactionId?: string;
  payload: Record<string, any>;
  meta: { nopol: string; customer: string; supir: string; };
  savedAt: string;
  status: "draft" | "failed";
}

interface DraftStatusChange {
  draftId: string;
  type: "status_change";
  transactionId: string;
  payload: { status: string; payment_method: string; };
  meta: { nopol: string; customer: string; supir: string; previousStatus: string; };
  savedAt: string;
  status: "draft" | "failed";
}

// ─── Draft helpers ────────────────────────────────────────────────────────────

const DRAFT_KEY = "timbangan_drafts";

function getDrafts(): DraftTimbangan[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(DRAFT_KEY) || "[]");
}

function removeDraft(draftId: string) {
  const updated = getDrafts().filter((d) => d.draftId !== draftId);
  localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
}

function updateDraftStatus(draftId: string, status: DraftTimbangan["status"]) {
  const updated = getDrafts().map((d) => d.draftId === draftId ? { ...d, status } : d);
  localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
}

function formatDraftTime(isoString: string): string {
  return new Date(isoString).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TimbanganPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleRaw = params.role as string;
  const role = !roleRaw || roleRaw === "undefined" ? "branch" : roleRaw;

  const [isLoading, setIsLoading] = useState(true);
  const [antrian, setAntrian] = useState<any[]>([]);
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");
  const [summary, setSummary] = useState({ inQueue: 0, paid: 0, unpaid: 0 });
  const [drafts, setDrafts] = useState<DraftTimbangan[]>([]);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const riwayatLimit = 10;
  const [riwayatPagination, setRiwayatPagination] = useState({
    per_page: riwayatLimit, number_page: 1, total_page: 1, total_data: 0,
  });
  const currentPage = Number(searchParams.get("page") || 1);
  const [authLocationId, setAuthLocationId] = useState("");

  useEffect(() => {
    axios.get<{ data?: { location_id?: string } }>("/api/auth/me")
      .then((res) => setAuthLocationId(res.data?.data?.location_id || ""))
      .catch(() => {});
  }, []);

  const resolvedLocationId = authLocationId;

  // Load drafts
  useEffect(() => { setDrafts(getDrafts()); }, []);

  // Toast handler
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setToastType("success");
      setToastMessage("Data Berhasil Disimpan");
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
    if (searchParams.get("draft") === "true") {
      setToastType("warning");
      setToastMessage("Koneksi bermasalah. Data disimpan sebagai draft.");
      setShowToast(true);
      setDrafts(getDrafts());
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Auto-retry saat online
  useEffect(() => {
    const handleOnline = () => {
      getDrafts().filter((d) => d.status === "draft").forEach((d) => retrySyncDraft(d.draftId, true));
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  const retrySyncDraft = async (draftId: string, silent = false) => {
    setRetryingId(draftId);
    try {
      const draft = getDrafts().find((d) => d.draftId === draftId);
      if (!draft) return;

      if (draft.type === "loading_in") {
        await axios.post("/api/branch/transaction/in", draft.payload);
      } else if (draft.type === "loading_out" && draft.transactionId) {
        await axios.put(`/api/branch/transaction/out/${draft.transactionId}`, draft.payload);
      }

      removeDraft(draftId);
      setDrafts(getDrafts());

      if (!silent) {
        setToastType("success");
        setToastMessage("Draft berhasil disinkronkan!");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch {
      updateDraftStatus(draftId, "failed");
      setDrafts(getDrafts());
    } finally {
      setRetryingId(null);
    }
  };

  const handleDeleteDraft = (draftId: string) => {
    removeDraft(draftId);
    setDrafts(getDrafts());
  };

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value || 0);
  }

  function formatKw(value: number) {
    return `${new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((value || 0) / 100)} kw`;
  }

  function formatExportDateLabel(value: string) {
    if (!value) return "ALL";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "2-digit", month: "short", year: "numeric" }).format(parsed);
  }

  function getExportRangeLabel() {
    const startDate = searchParams.get("start_date") || "";
    const endDate = searchParams.get("end_date") || "";
    if (startDate && endDate) {
      return startDate === endDate ? formatExportDateLabel(startDate) : `${formatExportDateLabel(startDate)} s.d ${formatExportDateLabel(endDate)}`;
    }
    const ownershipType = searchParams.get("ownership_type") || "";
    const status = searchParams.get("status") || "";
    const customer = searchParams.get("customer") || "";
    if (ownershipType || status || customer) return [ownershipType, status, customer].filter(Boolean).join(" - ");
    return "ALL";
  }

  const handlePageChange = (page: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (page > 1) nextParams.set("page", String(page));
    else nextParams.delete("page");
    router.push(`/${role}/timbangan?${nextParams.toString()}`);
  };

  const handleStatusChange = async (id: string, status: string) => {
    const currentItem = riwayat.find((item) => item.id === id);
    if (!currentItem) {
      setToastType("error");
      setToastMessage("Data transaksi tidak ditemukan");
      setShowToast(true);
      return;
    }
    try {
      const response = await axios.put(`/api/branch/transaction/payment/${id}`, { status, payment_method: currentItem.payment_method });
      setRiwayat((current) => current.map((item) => item.id === id ? { ...item, status: status as "paid" | "unpaid" } : item));
      setSummary((current) => ({
        ...current,
        paid: status === "paid" ? current.paid + 1 : Math.max(0, current.paid - 1),
        unpaid: status === "unpaid" ? current.unpaid + 1 : Math.max(0, current.unpaid - 1),
      }));
      setToastType("success");
      setToastMessage(response.data?.message || "Status transaksi berhasil diperbarui");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      const apiMessage = axios.isAxiosError(error) ? (error.response?.data?.message as string | undefined) : undefined;
      setToastType("error");
      setToastMessage(apiMessage || "Gagal memperbarui status transaksi");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get<TimbanganHistoryResponse>("/api/history/transaction", {
        params: {
          page: 1, limit: riwayatPagination.total_data || 1000, location_id: resolvedLocationId,
          ...(searchParams.get("start_date") ? { start_date: searchParams.get("start_date") } : {}),
          ...(searchParams.get("end_date") ? { end_date: searchParams.get("end_date") } : {}),
          ...(searchParams.get("ownership_type") ? { ownership_type: searchParams.get("ownership_type") } : {}),
          ...(searchParams.get("status") ? { status: searchParams.get("status") } : {}),
          ...(searchParams.get("customer") ? { customer: searchParams.get("customer") } : {}),
        },
      });
      const rows = (response.data?.data?.history ?? []).map((item) => ({
        Tanggal: item.tanggal_transaksi, Masuk: item.loading_in, Keluar: item.loading_out,
        Nopol: item.no_pol_truck, Supir: item.nama_driver, Ownership: item.type_ownership ?? "",
        Customer: item.nama_petani, Bruto: formatKw(item.bruto), Tarre: formatKw(item.tara),
        Netto: formatKw(item.netto), Amount: formatCurrency(item.amount),
        Payment: item.payment_method, Status: item.status,
      }));
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Timbangan");
      XLSX.writeFile(workbook, `MUSLA_TRANS_UTAMA - TIMBANGAN - (${getExportRangeLabel()}).xlsx`);
    } catch (error) {
      console.error("Error exporting timbangan data:", error);
    }
  };

  useEffect(() => {
    if (!resolvedLocationId) return;
    axios.get(`/api/location/${resolvedLocationId}`)
      .then((res) => { if (res.data?.data) setLocation(res.data.data); })
      .catch((err) => console.error("Error fetching location data:", err));
  }, [resolvedLocationId]);

  useEffect(() => {
    if (!resolvedLocationId) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const antrianResponse = await axios.get<TimbanganHistoryResponse>("/api/history/transaction", {
          params: { limit: 10, location_id: resolvedLocationId },
        });
        setSummary({
          inQueue: Number(antrianResponse.data?.kpi?.inqueue ?? 0),
          paid: Number(antrianResponse.data?.kpi?.paid ?? 0),
          unpaid: Number(antrianResponse.data?.kpi?.unpaid ?? 0),
        });
        setAntrian((antrianResponse.data?.data?.inQueue ?? []).map((item) => ({
          id: item.id, transaction_date: item.tanggal_transaksi, loading_in: item.loading_in,
          license_plate: item.no_pol_truck, driver_name: item.nama_driver,
          ownership_type: item.type_ownership ?? "", customer_name: item.nama_petani, bruto_weight: item.bruto,
        })));

        const riwayatResponse = await axios.get<TimbanganHistoryResponse>("/api/history/transaction", {
          params: {
            page: currentPage, limit: riwayatLimit, location_id: resolvedLocationId,
            ...(searchParams.get("start_date") ? { start_date: searchParams.get("start_date") } : {}),
            ...(searchParams.get("end_date") ? { end_date: searchParams.get("end_date") } : {}),
            ...(searchParams.get("ownership_type") ? { ownership_type: searchParams.get("ownership_type") } : {}),
            ...(searchParams.get("status") ? { status: searchParams.get("status") } : {}),
            ...(searchParams.get("customer") ? { customer: searchParams.get("customer") } : {}),
          },
        });
        setRiwayat((riwayatResponse.data?.data?.history ?? []).map((item) => ({
          id: item.id, transaction_date: item.tanggal_transaksi, loading_in: item.loading_in,
          loading_out: item.loading_out, license_plate: item.no_pol_truck, driver_name: item.nama_driver,
          ownership_type: item.type_ownership ?? "", customer_name: item.nama_petani,
          bruto_weight: item.bruto, tarra_weight: item.tara, netto_weight: item.netto,
          total_price: item.amount, payment_method: item.payment_method, status: item.status,
        })));
        if (riwayatResponse.data?.page) {
          setRiwayatPagination({
            per_page: riwayatLimit,
            number_page: riwayatResponse.data.page.number_page || currentPage,
            total_page: riwayatResponse.data.page.total_page || 1,
            total_data: riwayatResponse.data.page.total_data || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching timbangan data:", error);
        setAntrian([]); setRiwayat([]); setSummary({ inQueue: 0, paid: 0, unpaid: 0 });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [searchParams, currentPage, resolvedLocationId]);

  return (
    <div className="flex flex-col w-full max-w-full pb-10 gap-8">
      <Toast isVisible={showToast} message={toastMessage} type={toastType} />

      <PageHeader
        title="Timbangan"
        thirdAction={{ label: "Export", onClick: handleExport, icon: <Export size={18} weight="bold" />, variant: "white" }}
        primaryAction={{ label: "Add", onClick: () => router.push(`/${role}/timbangan/add`) }}
        secondaryAction={{ label: "Filter", onClick: () => setIsFilterOpen(true) }}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Today" value={`${summary.inQueue} Truk`} title="Dalam Antrian" />
        <StatCard label="Today" value={formatCurrency(summary.paid)} title="Dibayar" />
        <StatCard label="Today" value={formatCurrency(summary.unpaid)} title="Belum Dibayar" />
        <StatCard label="Harga Patokan" value={location ? formatCurrency(location.sugar_price) : "Rp 0"} title="Harga tebu" />
      </div>

      {/* ── DRAFT SECTION ─────────────────────────────────────── */}
      {drafts.length > 0 && (
        <Card
          title={
            <div className="flex items-center gap-2">
              <CloudSlash size={18} weight="bold" className="text-amber-500" />
              <span className="text-amber-700">Draft Belum Tersinkron ({drafts.length})</span>
            </div>
          }
          noPadding
        >
          <div className="mx-6 mt-4 mb-2 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
            <span className="text-xs font-medium text-amber-700">
              Data berikut tersimpan lokal dan belum terkirim ke server. Klik <strong>Coba Lagi</strong> untuk menyinkronkan.
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-amber-100 text-xs font-semibold text-amber-400">
                  <th className="px-6 py-4">Tipe</th>
                  <th className="px-6 py-4">Nopol</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Supir</th>
                  <th className="px-6 py-4">Disimpan Pada</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {drafts.map((draft) => (
                  <tr key={draft.draftId} className="bg-amber-50/40 hover:bg-amber-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-700">
                        {draft.type === "loading_in" ? "Loading In" : "Loading Out"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-800">{draft.meta.nopol}</td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">{draft.meta.customer}</td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">{draft.meta.supir}</td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-400">{formatDraftTime(draft.savedAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${draft.status === "failed" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${draft.status === "failed" ? "bg-red-500" : "bg-amber-500"}`} />
                        {draft.status === "failed" ? "Gagal" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => retrySyncDraft(draft.draftId)}
                          disabled={retryingId === draft.draftId}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-xs font-bold text-amber-700 hover:bg-amber-50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowClockwise size={13} weight="bold" className={retryingId === draft.draftId ? "animate-spin" : ""} />
                          {retryingId === draft.draftId ? "Menyimpan..." : "Coba Lagi"}
                        </button>
                        <button
                          onClick={() => handleDeleteDraft(draft.draftId)}
                          className="p-1.5 text-gray-400 hover:text-red-500 border border-gray-100 rounded-xl hover:border-red-100 hover:bg-red-50 transition-all cursor-pointer"
                        >
                          <Trash size={14} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-8">
        <AntrianTable data={antrian} isLoading={isLoading} role={role} />
        <RiwayatTimbanganTable
          data={riwayat}
          isLoading={isLoading}
          onEdit={(id) => router.push(`/${role}/timbangan/edit/${id}`)}
          onDelete={(id) => { setSelectedId(id); setIsDeleteOpen(true); }}
          onStatusChange={handleStatusChange}
          pagination={riwayatPagination}
          onPageChange={handlePageChange}
        />
      </div>

      <TimbanganFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        initialValues={{
          startDate: searchParams.get("start_date") ?? "",
          endDate: searchParams.get("end_date") ?? "",
          customer: searchParams.get("customer") ?? "",
          ownership_type: (searchParams.get("ownership_type") as any) ?? "",
          status: (searchParams.get("status") as any) ?? "",
        }}
        onApply={(f) => {
          const nextParams = new URLSearchParams();
          const locationId = searchParams.get("location_id");
          if (locationId) nextParams.set("location_id", locationId);
          nextParams.delete("page");
          if (f.startDate) nextParams.set("start_date", f.startDate);
          if (f.endDate) nextParams.set("end_date", f.endDate);
          if (f.customer) nextParams.set("customer", f.customer);
          if (f.ownership_type) nextParams.set("ownership_type", f.ownership_type);
          if (f.status) nextParams.set("status", f.status);
          router.push(`/${role}/timbangan?${nextParams.toString()}`);
          setIsFilterOpen(false);
        }}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => console.log("Delete", selectedId)}
      />
    </div>
  );
}