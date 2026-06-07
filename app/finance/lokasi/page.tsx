"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DeleteModal, Toast, Card, ActionMenu, Pagination } from "@/components/ui";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DotsThreeVertical, Export, CloudSlash, ArrowClockwise, Trash } from "@phosphor-icons/react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface LocationItem {
  id: string;
  name: string;
  account_number: string | null;
  account_balance: number | null;
  sugar_price: number;
}

interface DraftLokasi {
  draftId: string;
  name: string;
  sugar_price: string;
  account_balance: string;
  account_number: string;
  savedAt: string;
  status: "draft" | "synced" | "failed";
}

interface PaginationMeta {
  number_page: number;
  total_page: number;
  total_data: number;
}

interface LocationListResponse {
  statusCode: number;
  data: LocationItem[];
  page: PaginationMeta;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;
const DRAFT_KEY = "lokasi_drafts";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parsePageParam(value: string | null) {
  const parsed = Number.parseInt(value ?? "1", 10);
  if (Number.isNaN(parsed) || parsed < 1) return 1;
  return parsed;
}

function getDrafts(): DraftLokasi[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(DRAFT_KEY) || "[]");
}

function removeDraft(draftId: string) {
  const updated = getDrafts().filter((d) => d.draftId !== draftId);
  localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
}

function updateDraftStatus(draftId: string, status: DraftLokasi["status"]) {
  const updated = getDrafts().map((d) =>
    d.draftId === draftId ? { ...d, status } : d
  );
  localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
}

function formatDraftTime(isoString: string): string {
  return new Date(isoString).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LokasiPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = parsePageParam(searchParams.get("page"));

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [drafts, setDrafts] = useState<DraftLokasi[]>([]);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    number_page: currentPage,
    total_page: 1,
    total_data: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedLocationName, setSelectedLocationName] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Data Berhasil Disimpan");
  const [toastType, setToastType] = useState<"success" | "warning">("success");

  // Fetch lokasi dari API
  useEffect(() => {
    let isMounted = true;
    async function fetchLocations() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/location?page=${currentPage}&limit=${PAGE_SIZE}`,
          { cache: "no-store" }
        );
        if (!response.ok) throw new Error("Failed to fetch locations");
        const result = (await response.json()) as LocationListResponse;
        if (!isMounted) return;
        setLocations(result.data ?? []);
        setPagination(result.page ?? { number_page: currentPage, total_page: 1, total_data: result.data?.length ?? 0 });
      } catch (error) {
        if (!isMounted) return;
        console.error("Error fetching locations:", error);
        setLocations([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchLocations();
    return () => { isMounted = false; };
  }, [currentPage]);

  // Load drafts dari localStorage
  useEffect(() => {
    setDrafts(getDrafts());
  }, []);

  // Toast handler (success & draft)
  useEffect(() => {
    const sessionKey = "lokasi_navigated";
    const isClientNavigation = sessionStorage.getItem(sessionKey) === "true";

    if (!isClientNavigation && searchParams.toString()) {
      router.replace(pathname);
      return;
    }

    if (searchParams.get("success") === "true") {
      setToastMessage("Data Berhasil Disimpan");
      setToastType("success");
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      const cleanParams = new URLSearchParams(searchParams.toString());
      cleanParams.delete("success");
      router.replace(cleanParams.toString() ? `${pathname}?${cleanParams}` : pathname);
      return () => clearTimeout(timer);
    }

    if (searchParams.get("draft") === "true") {
      setToastMessage("Koneksi bermasalah. Data disimpan sebagai draft.");
      setToastType("warning");
      setShowToast(true);
      setDrafts(getDrafts()); // reload drafts
      const timer = setTimeout(() => setShowToast(false), 4000);
      const cleanParams = new URLSearchParams(searchParams.toString());
      cleanParams.delete("draft");
      router.replace(cleanParams.toString() ? `${pathname}?${cleanParams}` : pathname);
      return () => clearTimeout(timer);
    }
  }, [pathname, router, searchParams]);

  // Auto-retry saat koneksi kembali
  useEffect(() => {
    const handleOnline = () => {
      getDrafts()
        .filter((d) => d.status === "draft")
        .forEach((d) => retrySyncDraft(d.draftId, true));
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  const retrySyncDraft = async (draftId: string, silent = false) => {
    setRetryingId(draftId);
    try {
      const draft = getDrafts().find((d) => d.draftId === draftId);
      if (!draft) return;

      const response = await fetch("/api/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          sugar_price: Number(draft.sugar_price),
          account_balance: draft.account_balance ? Number(draft.account_balance) : 0,
          account_number: draft.account_number,
        }),
      });

      if (!response.ok) throw new Error("API error");

      // Sukses → hapus draft, refresh list
      removeDraft(draftId);
      setDrafts(getDrafts());

      // Refresh data dari API agar data asli muncul
      const res = await fetch(`/api/location?page=${currentPage}&limit=${PAGE_SIZE}`, { cache: "no-store" });
      if (res.ok) {
        const result = (await res.json()) as LocationListResponse;
        setLocations(result.data ?? []);
        setPagination(result.page ?? { number_page: currentPage, total_page: 1, total_data: 0 });
      }

      if (!silent) {
        setToastMessage("Draft berhasil disinkronkan!");
        setToastType("success");
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

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.total_page) return;
    sessionStorage.setItem("lokasi_navigated", "true");
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("page", String(page));
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  const handleDeleteConfirm = async () => {
    if (selectedLocationId) {
      try {
        const response = await fetch(`/api/location/${selectedLocationId}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to delete location");
        setLocations((prev) => prev.filter((loc) => loc.id !== selectedLocationId));
        setToastMessage("Data Lokasi Berhasil Dihapus");
        setToastType("success");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (error) {
        console.error("Error deleting location:", error);
      }
    }
    setIsDeleteModalOpen(false);
  };

  const handleExport = () => {
    if (typeof window === "undefined") return;
    import("xlsx").then((XLSX) => {
      const worksheet = XLSX.utils.json_to_sheet(
        locations.map((row) => ({
          "Nama Lokasi": row.name,
          "Account Number": row.account_number ?? "-",
          Balance: row.account_balance != null
            ? `Rp ${new Intl.NumberFormat("id-ID").format(row.account_balance)}`
            : "Rp 0",
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Locations");
      XLSX.writeFile(workbook, "Data_Lokasi.xlsx");
    });
  };

  return (
    <div className="p-8 space-y-8 bg-[#F9FAFB] min-h-[calc(100vh-72px)]">
      <Toast isVisible={showToast} message={toastMessage} type={toastType} />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        message={`Apakah anda yakin ingin menghapus data lokasi ${selectedLocationName || ""} ini?`}
      />

      <PageHeader
        title="Data Lokasi"
        primaryAction={{
          label: "Add",
          onClick: () => {
            sessionStorage.setItem("lokasi_navigated", "true");
            router.push("/finance/lokasi/add");
          },
        }}
      />

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
              Data berikut tersimpan lokal dan belum terkirim ke server. Klik{" "}
              <strong>Coba Lagi</strong> untuk menyinkronkan.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-amber-100 text-xs font-semibold text-amber-400">
                  <th className="px-8 py-4">Nama Lokasi</th>
                  <th className="px-8 py-4">Account Number</th>
                  <th className="px-8 py-4">Saldo Awal</th>
                  <th className="px-8 py-4">Harga Tebu</th>
                  <th className="px-8 py-4">Disimpan Pada</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {drafts.map((draft) => (
                  <tr key={draft.draftId} className="bg-amber-50/40 hover:bg-amber-50/70 transition-colors">
                    <td className="px-8 py-4 text-xs font-semibold text-gray-800">{draft.name}</td>
                    <td className="px-8 py-4 text-xs font-medium text-gray-500">{draft.account_number || "-"}</td>
                    <td className="px-8 py-4 text-xs font-medium text-gray-500">
                      Rp {new Intl.NumberFormat("id-ID").format(Number(draft.account_balance || 0))}
                    </td>
                    <td className="px-8 py-4 text-xs font-medium text-gray-500">
                      Rp {new Intl.NumberFormat("id-ID").format(Number(draft.sugar_price || 0))}
                    </td>
                    <td className="px-8 py-4 text-xs font-medium text-gray-400">
                      {formatDraftTime(draft.savedAt)}
                    </td>
                    <td className="px-8 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        draft.status === "failed" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          draft.status === "failed" ? "bg-red-500" : "bg-amber-500"
                        }`} />
                        {draft.status === "failed" ? "Gagal" : "Draft"}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => retrySyncDraft(draft.draftId)}
                          disabled={retryingId === draft.draftId}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-xs font-bold text-amber-700 hover:bg-amber-50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowClockwise
                            size={13}
                            weight="bold"
                            className={retryingId === draft.draftId ? "animate-spin" : ""}
                          />
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

      {/* ── MAIN TABLE ────────────────────────────────────────── */}
      <Card
        title="Data Lokasi"
        noPadding
        headerAction={
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer transition-all"
          >
            <Export size={16} weight="bold" />
            <span>Export</span>
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400">
                <th className="px-8 py-5 text-left font-semibold text-gray-400">Nama Lokasi</th>
                <th className="px-8 py-5 text-left font-semibold text-gray-400">Account Number</th>
                <th className="px-8 py-5 text-left font-semibold text-gray-400">Balance</th>
                <th className="px-8 py-5 text-right font-semibold text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-5"><div className="h-4 bg-gray-100 rounded-lg w-24"></div></td>
                    <td className="px-8 py-5"><div className="h-4 bg-gray-100 rounded-lg w-32"></div></td>
                    <td className="px-8 py-5"><div className="h-4 bg-gray-100 rounded-lg w-24"></div></td>
                    <td className="px-8 py-5 text-right"><div className="h-9 bg-gray-50 rounded-xl w-9 ml-auto"></div></td>
                  </tr>
                ))
              ) : locations.length > 0 ? (
                locations.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4 text-xs font-semibold text-[#111827] text-left">{row.name}</td>
                    <td className="px-8 py-4 text-xs font-medium text-gray-500 text-left">{row.account_number || "-"}</td>
                    <td className="px-8 py-4 text-xs font-medium text-gray-500 text-left">
                      {row.account_balance != null
                        ? `Rp ${new Intl.NumberFormat("id-ID").format(row.account_balance)}`
                        : "Rp 0"}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <ActionMenu
                        trigger={
                          <button className="p-2 text-gray-400 hover:text-gray-900 border border-gray-100 rounded-xl hover:bg-white hover:shadow-sm transition-all inline-flex items-center justify-center cursor-pointer">
                            <DotsThreeVertical size={18} weight="bold" />
                          </button>
                        }
                        items={[
                          {
                            label: "Edit",
                            onClick: () => router.push(`/finance/lokasi/edit/${row.id}`),
                          },
                          {
                            label: "Hapus",
                            variant: "danger",
                            onClick: () => {
                              setSelectedLocationId(row.id);
                              setSelectedLocationName(row.name);
                              setIsDeleteModalOpen(true);
                            },
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-sm font-medium text-gray-400">
                    Tidak ada data lokasi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {!isLoading && locations.length > 0 && (
        <Pagination
          currentPage={pagination.number_page}
          totalPages={pagination.total_page}
          totalData={pagination.total_data}
          showingData={locations.length}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}