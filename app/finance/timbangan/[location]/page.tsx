"use client";

import React from "react";
import axios from "@/lib/axios";
import * as XLSX from "xlsx";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CaretDown,
  Export,
  PencilSimple,
  CaretLeft,
  CaretRight,
  X,
  Funnel,
  ArrowRight,
  CalendarBlank,
} from "@phosphor-icons/react";

interface TimbanganQueueItem {
  id: string;
  tanggal_transaksi: string;
  loading_in: string;
  no_pol_truck: string;
  nama_driver: string;
  type_ownership: string | null;
  nama_petani: string;
  bruto: number;
}

interface TimbanganHistoryItem {
  id: string;
  tanggal_transaksi: string;
  loading_in: string;
  loading_out: string;
  no_pol_truck: string;
  nama_driver: string;
  type_ownership: string | null;
  nama_petani: string;
  bruto: number;
  tara: number;
  netto: number;
  amount: number;
  payment_method: string;
  status: "paid" | "unpaid" | "queue";
}

interface TimbanganHistoryResponse {
  statusCode: number;
  kpi: {
    paid: number;
    unpaid: number;
    inqueue: number;
  };
  data: {
    inQueue: TimbanganQueueItem[];
    history: TimbanganHistoryItem[];
  };
  page?: {
    number_page: number;
    total_page: number;
    total_data: number;
    per_page: number;
  };
}

interface LocationResponse {
  statusCode: number;
  data: {
    id: string;
    name: string;
    sugar_price: number;
  };
}

const PAGE_SIZE = 10;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatKw(value: number) {
  return `${new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format((value || 0) / 100)} kw`;
}

function formatDisplayDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function normalizeOwnershipLabel(value: string | null) {
  if (value === "farmer") return "Petani";
  if (value === "private") return "Private";
  return value || "-";
}

function normalizeStatusLabel(value: string) {
  if (value === "paid") return "Paid";
  if (value === "unpaid") return "Unpaid";
  if (value === "queue") return "In Queue";
  return value;
}

function buildQueryParams(current: URLSearchParams, updates: Record<string, string | null | undefined>) {
  const next = new URLSearchParams(current.toString());

  Object.entries(updates).forEach(([key, value]) => {
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
  });

  return next;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export default function TimbanganLocationPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const location = (params?.location as string) || "";

  const currentPage = Number(searchParams.get("page") || 1);
  const currentStartDate = searchParams.get("start_date") || "";
  const currentEndDate = searchParams.get("end_date") || "";
  const currentCustomer = searchParams.get("customer") || "";
  const currentOwnershipType = searchParams.get("ownership_type") || "";
  const currentStatus = searchParams.get("status") || "";

  const getCityName = (id: string) => {
    const map: Record<string, string> = {
      "loc-1": "Malang",
      "loc-2": "Blitar",
      "loc-3": "Kediri 1",
      "loc-4": "Kediri 2",
      "malang": "Malang",
      "blitar": "Blitar",
      "kediri-1": "Kediri 1",
      "kediri-2": "Kediri 2",
    };
    return map[id] || id.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const [locationName, setLocationName] = React.useState(getCityName(location));
  const [sugarPrice, setSugarPrice] = React.useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isSavingPrice, setIsSavingPrice] = React.useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);
  const [priceInput, setPriceInput] = React.useState("");
  const [startDate, setStartDate] = React.useState(currentStartDate);
  const [endDate, setEndDate] = React.useState(currentEndDate);
  const [customer, setCustomer] = React.useState(currentCustomer);
  const [ownership, setOwnership] = React.useState(currentOwnershipType);
  const [status, setStatus] = React.useState(currentStatus);
  const [isLoading, setIsLoading] = React.useState(true);
  const [inQueue, setInQueue] = React.useState<TimbanganQueueItem[]>([]);
  const [history, setHistory] = React.useState<TimbanganHistoryItem[]>([]);
  const [pagination, setPagination] = React.useState({
    number_page: 1,
    total_page: 1,
    total_data: 0,
    per_page: PAGE_SIZE,
  });
  const [kpi, setKpi] = React.useState({
    paid: 0,
    unpaid: 0,
    inqueue: 0,
  });

  React.useEffect(() => {
    setStartDate(currentStartDate);
    setEndDate(currentEndDate);
    setCustomer(currentCustomer);
    setOwnership(currentOwnershipType);
    setStatus(currentStatus);
  }, [currentStartDate, currentEndDate, currentCustomer, currentOwnershipType, currentStatus]);

  React.useEffect(() => {
    let isMounted = true;

    async function fetchLocationName() {
      if (!location) {
        return;
      }

      try {
        const response = await axios.get<LocationResponse>(`/api/location/${location}`);

        if (!isMounted) {
          return;
        }

        setLocationName(response.data?.data?.name || "");
        setSugarPrice(Number(response.data?.data?.sugar_price ?? 0));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Error fetching location name:", error);
        setLocationName(getCityName(location));
        setSugarPrice(0);
      }
    }

    void fetchLocationName();

    return () => {
      isMounted = false;
    };
  }, [location]);

  React.useEffect(() => {
    let isMounted = true;

    async function fetchTimbanganData() {
      if (!location) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const response = await axios.get<TimbanganHistoryResponse>("/api/history/transaction", {
          params: {
            page: currentPage,
            limit: PAGE_SIZE,
            location_id: location,
            ...(currentStartDate ? { start_date: currentStartDate } : {}),
            ...(currentEndDate ? { end_date: currentEndDate } : {}),
            ...(currentCustomer ? { customer: currentCustomer } : {}),
            ...(currentOwnershipType ? { ownership_type: currentOwnershipType } : {}),
            ...(currentStatus ? { status: currentStatus } : {}),
          },
        });

        if (!isMounted) {
          return;
        }

        setKpi({
          paid: Number(response.data?.kpi?.paid ?? 0),
          unpaid: Number(response.data?.kpi?.unpaid ?? 0),
          inqueue: Number(response.data?.kpi?.inqueue ?? 0),
        });
        setInQueue(response.data?.data?.inQueue ?? []);
        setHistory(response.data?.data?.history ?? []);
        setPagination(
          response.data?.page ?? {
            number_page: currentPage,
            total_page: 1,
            total_data: response.data?.data?.history?.length ?? 0,
            per_page: PAGE_SIZE,
          },
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Error fetching timbangan history:", error);
        setKpi({ paid: 0, unpaid: 0, inqueue: 0 });
        setInQueue([]);
        setHistory([]);
        setPagination({
          number_page: currentPage,
          total_page: 1,
          total_data: 0,
          per_page: PAGE_SIZE,
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchTimbanganData();

    return () => {
      isMounted = false;
    };
  }, [currentPage, currentStartDate, currentEndDate, currentCustomer, currentOwnershipType, currentStatus, location]);

  const handleSavePrice = async () => {
    if (!priceInput || !location) return;
    setIsSavingPrice(true);
    try {
      await axios.put(`/api/finance/sugar/${location}`, {
        price: Number(priceInput),
      });
      setSugarPrice(Number(priceInput));
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Failed to update price:", err);
    } finally {
      setIsSavingPrice(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.total_page) {
      return;
    }

    const nextParams = buildQueryParams(searchParams, { page: String(page) });
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  const handleApplyFilters = () => {
    const nextParams = buildQueryParams(searchParams, {
      start_date: startDate,
      end_date: endDate,
      customer,
      ownership_type: ownership,
      status,
      page: "1",
    });

    router.push(`${pathname}?${nextParams.toString()}`);
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setCustomer("");
    setOwnership("");
    setStatus("");

    const nextParams = buildQueryParams(searchParams, {
      start_date: null,
      end_date: null,
      customer: null,
      ownership_type: null,
      status: null,
      page: "1",
    });

    router.push(`${pathname}?${nextParams.toString()}`);
  };

  const handleExportQueue = () => {
    const rows = inQueue.map((row) => ({
      Tanggal: row.tanggal_transaksi,
      Masuk: row.loading_in,
      Nopol: row.no_pol_truck,
      Supir: row.nama_driver,
      Ownership: normalizeOwnershipLabel(row.type_ownership),
      Customer: row.nama_petani,
      Bruto: formatKw(row.bruto),
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Antrian Timbangan");
    XLSX.writeFile(workbook, `MUSLA_TRANS_UTAMA - ANTRIAN - ${locationName || location}.xlsx`);
  };

  const handleExportHistory = async () => {
    try {
      const response = await axios.get<TimbanganHistoryResponse>("/api/history/transaction", {
        params: {
          page: 1,
          limit: pagination.total_data || 1000,
          location_id: location,
          ...(currentStartDate ? { start_date: currentStartDate } : {}),
          ...(currentEndDate ? { end_date: currentEndDate } : {}),
        },
      });

      const rows = (response.data?.data?.history ?? []).map((row) => ({
        Tanggal: row.tanggal_transaksi,
        Masuk: row.loading_in,
        Keluar: row.loading_out,
        Nopol: row.no_pol_truck,
        Supir: row.nama_driver,
        Ownership: normalizeOwnershipLabel(row.type_ownership),
        Customer: row.nama_petani,
        Bruto: formatKw(row.bruto),
        Tarre: formatKw(row.tara),
        Netto: formatKw(row.netto),
        Amount: formatCurrency(row.amount),
        Payment: row.payment_method,
        Status: normalizeStatusLabel(row.status),
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Timbangan");
      XLSX.writeFile(workbook, `MUSLA_TRANS_UTAMA - TIMBANGAN - ${locationName || location}.xlsx`);
    } catch (error) {
      console.error("Error exporting timbangan history:", error);
    }
  };

  return (
    <>
      {isEditModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setIsEditModalOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-sm rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="pt-8 px-8 flex items-center justify-between">
              <div className="w-6"></div>
              <h2 className="text-xl font-bold text-gray-900">Edit Harga Tebu</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-900 ml-1">Input Harga</label>
                <input
                  type="text"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="Masukkan harga baru..."
                  className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]/10 focus:border-[#00A859] transition-all text-sm font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePrice}
                  disabled={isSavingPrice}
                  className="flex-1 px-6 py-4 bg-[#00A859] text-white rounded-2xl text-sm font-bold hover:bg-[#008F4C] shadow-lg shadow-green-500/20 transition-all disabled:opacity-60"
                >
                  {isSavingPrice ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFilterModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setIsFilterModalOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-sm rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="pt-6 px-8 flex items-center justify-between">
              <div className="w-6"></div>
              <h2 className="text-lg font-bold text-gray-900">Filter</h2>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <div className="px-8 pb-8 pt-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-900 ml-1">Awal tanggal</label>
                  <div className="relative group/date">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      onClick={(e) => e.currentTarget.showPicker?.()}
                      className="w-full pl-3 pr-2 py-2.5 bg-white border border-gray-100 rounded-xl text-[12px] font-medium text-gray-900 focus:outline-none shadow-sm cursor-pointer block"
                    />
                    <CalendarBlank size={14} weight="bold" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover/date:text-gray-900 transition-colors" />
                  </div>
                </div>
                <div className="pt-5">
                  <ArrowRight size={12} weight="bold" className="text-gray-400" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-900 ml-1">Akhir tanggal</label>
                  <div className="relative group/date">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      onClick={(e) => e.currentTarget.showPicker?.()}
                      className="w-full pl-3 pr-2 py-2.5 bg-white border border-gray-100 rounded-xl text-[12px] font-medium text-gray-900 focus:outline-none shadow-sm cursor-pointer block"
                    />
                    <CalendarBlank size={14} weight="bold" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover/date:text-gray-900 transition-colors" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-900 ml-1">Customer</label>
                <input
                  type="text"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-[12px] font-medium text-gray-900 focus:outline-none focus:border-[#00A859] transition-colors shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-900 ml-1">Ownership</label>
                <div className="relative">
                  <select
                    value={ownership}
                    onChange={(e) => setOwnership(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-[12px] font-medium text-gray-900 focus:outline-none focus:border-[#00A859] transition-colors appearance-none shadow-sm cursor-pointer"
                  >
                    <option value="">Semua</option>
                    <option value="farmer">Petani</option>
                    <option value="private">Private</option>
                  </select>
                  <CaretDown size={14} weight="bold" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-900 ml-1">Status</label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-[12px] font-medium text-gray-900 focus:outline-none focus:border-[#00A859] transition-colors appearance-none shadow-sm cursor-pointer"
                  >
                    <option value="">Semua</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                  <CaretDown size={14} weight="bold" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all shadow-sm"
                >
                  Reset
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-2 py-3.5 bg-[#00A859] text-white rounded-2xl text-sm font-bold hover:bg-[#008F4C] shadow-lg shadow-green-500/20 transition-all"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Data Timbangan {locationName}</h1>
          <button
            onClick={() => setIsFilterModalOpen(true)}
            suppressHydrationWarning
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Funnel size={18} weight="bold" />
            Filter
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard label="In Queue" value={`${kpi.inqueue} Truk`} tag="Today" />
          <SummaryCard label="Paid" value={formatCurrency(kpi.paid)} tag="Today" />
          <SummaryCard label="Unpaid" value={formatCurrency(kpi.unpaid)} tag="Today" />
          <SummaryCard
            label="Harga tebu"
            value={formatCurrency(sugarPrice)}
            showEdit
            onEdit={() => {
              setPriceInput(String(sugarPrice || ""));
              setIsEditModalOpen(true);
            }}
          />
        </div>

        <section className="bg-white border border-gray-100 rounded-4xl overflow-hidden shadow-sm">
          <div className="p-8 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">Antrian Timbangan</h2>
              <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-lg">Today</span>
            </div>
            <button
              onClick={handleExportQueue}
              suppressHydrationWarning
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
            >
              <Export size={18} weight="bold" />
              Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-y border-gray-100">
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">tanggal</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Masuk</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nopol</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Supir</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ownership</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bruto</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-8 py-10 text-center text-sm font-medium text-gray-400">
                      Memuat antrian timbangan...
                    </td>
                  </tr>
                ) : inQueue.length > 0 ? (
                  inQueue.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">{formatDisplayDate(row.tanggal_transaksi)}</td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.loading_in}</td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.no_pol_truck}</td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.nama_driver}</td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">{normalizeOwnershipLabel(row.type_ownership)}</td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.nama_petani}</td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">{formatKw(row.bruto)}</td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-blue-50 text-[#0095FF] text-[10px] font-bold rounded-lg uppercase">
                          In Queue
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-8 py-10 text-center text-sm font-medium text-gray-400">
                      Tidak ada antrian timbangan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white border border-gray-100 rounded-4xl overflow-hidden shadow-sm">
          <div className="p-8 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">Riwayat Timbangan</h2>
              <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-lg">Today</span>
            </div>
            <button
              onClick={() => void handleExportHistory()}
              suppressHydrationWarning
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
            >
              <Export size={18} weight="bold" />
              Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-y border-gray-100">
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">tanggal</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Masuk</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Keluar</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nopol</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Supir</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ownership</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bruto</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tarre</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Netto</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={13} className="px-8 py-10 text-center text-sm font-medium text-gray-400">
                      Memuat riwayat timbangan...
                    </td>
                  </tr>
                ) : history.length > 0 ? (
                  history.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">{formatDisplayDate(row.tanggal_transaksi)}</td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.loading_in}</td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.loading_out}</td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.no_pol_truck}</td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.nama_driver}</td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">{normalizeOwnershipLabel(row.type_ownership)}</td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.nama_petani}</td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">{formatKw(row.bruto)}</td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">{formatKw(row.tara)}</td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">{formatKw(row.netto)}</td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">{formatCurrency(row.amount)}</td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.payment_method}</td>
                      <td className="px-8 py-5">
                        <span
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase ${
                            row.status === "paid"
                              ? "bg-green-50 text-green-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {normalizeStatusLabel(row.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={13} className="px-8 py-10 text-center text-sm font-medium text-gray-400">
                      Tidak ada riwayat timbangan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-8 border-t border-gray-50 flex flex-col items-center gap-6">
            <p className="text-xs font-bold text-gray-400">
              {pagination.total_data > 0
                ? `${history.length} data show from ${pagination.total_data} data`
                : "0 data show from 0 data"}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                suppressHydrationWarning
                className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all group"
              >
                <CaretLeft size={18} weight="bold" className="text-gray-400 group-hover:text-gray-900" />
                Previous
              </button>
              <div className="flex items-center gap-2">
                {getVisiblePages(pagination.number_page, pagination.total_page).map((page, index) =>
                  page === "..." ? (
                    <span key={`ellipsis-${index}`} className="w-12 h-12 flex items-center justify-center text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page as number)}
                      suppressHydrationWarning
                      className={`w-12 h-12 flex items-center justify-center rounded-xl text-sm font-bold ${
                        page === pagination.number_page
                          ? "bg-blue-50 text-[#0095FF] border border-blue-100"
                          : "hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                suppressHydrationWarning
                className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all group"
              >
                Next
                <CaretRight size={18} weight="bold" className="text-gray-400 group-hover:text-gray-900" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function SummaryCard({
  label,
  value,
  tag,
  showEdit,
  onEdit,
}: {
  label: string;
  value: string;
  tag?: string;
  showEdit?: boolean;
  onEdit?: () => void;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-4xl p-6 shadow-sm space-y-4 min-w-0">
      <div className="flex items-center justify-between gap-2">
        {showEdit ? (
          <button
            onClick={onEdit}
            suppressHydrationWarning
            className="flex items-center gap-1.5 text-[#0095FF] text-[10px] font-bold hover:underline shrink-0"
          >
            <PencilSimple size={14} weight="bold" />
            Edit Harga
          </button>
        ) : (
          <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-lg shrink-0">{tag}</span>
        )}
      </div>
      <div className="space-y-1 min-w-0">
        <h3 className="text-lg font-bold text-gray-900 truncate" title={value}>
          {value}
        </h3>
        <span className="text-[11px] font-bold text-gray-400 block truncate">{label}</span>
      </div>
    </div>
  );
}