"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import * as XLSX from "xlsx";
import axios from "@/lib/axios";
import {
  CaretDown,
  DotsThreeVertical,
  Export,
  Eye,
  Plus,
} from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Card,
  Pagination,
  Select,
  StatCard,
  Toast,
} from "@/components/ui";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DateFilterModal } from "@/components/dashboard/DateFilterModal";
import { BuktiTransaksiModal } from "@/components/dashboard/BuktiTransaksiModal";
import { BuktiTransferReceiptModal } from "@/components/dashboard/BuktiTransferReceiptModal";
import { FinanceTopUpModal } from "@/components/finance/FinanceTopUpModal";

interface TransferHistoryItem {
  tanggal: string;
  waktu: string;
  bukti_tf: string | null;
  jumlah_nominal: number;
  location: string | null;
  transfer_status: "in" | "out";
  transaction_id: string | null;
}

interface ApiPaginationMeta {
  number_page: number;
  total_page: number;
  total_data: number;
}

interface ApiHistoryData {
  transaction_in: number;
  transaction_out: number;
  count_out_transaction: number;
  account_balance: number;
  transfer_history: TransferHistoryItem[];
  page: ApiPaginationMeta;
}

interface TransferHistoryResponse {
  statusCode: number;
  data: ApiHistoryData;
}

interface LocationResponse {
  statusCode: number;
  data: {
    id: string;
    name: string;
  };
}

interface TransactionDetail {
  id: string;
  transaction_date: string;
  loading_in: string;
  loading_out: string | null;
  bruto: number;
  tare: number;
  netto: number | null;
  current_price: number;
  total_price: number | null;
  payment_method: string;
  status: string;
  driver_name: string | null;
  truck_name: string;
  license_plate: string;
  owner_name: string | null;
  ownership_type: string | null;
  location_name: string;
  sugar_price: number;
}

interface SummaryData {
  transactionIn: number;
  transactionOut: number;
  countOutTransaction: number;
  accountBalance: number;
}

const PAGE_SIZE = 10;

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Failed to read file"));
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value || 0);
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

function normalizeRangeValue(value: string) {
  const normalized = value.toLowerCase();

  if (normalized === "all") return "all";
  if (["daily", "harian", "day"].includes(normalized)) return "daily";
  if (["weekly", "mingguan", "week"].includes(normalized)) return "weekly";
  if (["monthly", "bulanan", "month"].includes(normalized)) return "monthly";

  return "monthly";
}

function buildRangeRequestValue(value: string) {
  if (!value || value === "all") {
    return undefined;
  }

  return value;
}

function getRangeLabel(range: string) {
  if (range === "daily") return "Hari ini";
  if (range === "weekly") return "Mingguan";
  if (range === "monthly") return "Bulanan";
  return "Semua";
}

function buildReceiptImageSrc(value: string | null) {
  if (!value) {
    return null;
  }

  const fileName = value.split("/").pop()?.trim();

  if (!fileName) {
    return null;
  }

  return `/finance/transfer/${encodeURIComponent(fileName)}`;
}

export default function TransaksiLocationPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);

  const locationParam = Array.isArray(params.location)
    ? params.location[0]
    : (params.location as string | undefined);
  const locationId = locationParam || "";

  const currentPage = Number(searchParams.get("page") || 1);
  const currentRange = normalizeRangeValue(
    searchParams.get("range") || "monthly",
  );
  const currentStatus = searchParams.get("status") || "";
  const currentStartDate = searchParams.get("start_date") || "";
  const currentEndDate = searchParams.get("end_date") || "";

  const [isLoading, setIsLoading] = useState(true);
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

  const [locationName, setLocationName] = useState(getCityName(locationId));
  const [transactions, setTransactions] = useState<TransferHistoryItem[]>([]);
  const [pagination, setPagination] = useState<ApiPaginationMeta>({
    number_page: 1,
    total_page: 1,
    total_data: 0,
  });
  const [summary, setSummary] = useState<SummaryData>({
    transactionIn: 0,
    transactionOut: 0,
    countOutTransaction: 0,
    accountBalance: 0,
  });
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] =
    useState<TransactionDetail | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceiptImage, setSelectedReceiptImage] = useState<
    string | null
  >(null);
  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isTopUpSubmitting, setIsTopUpSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenRowMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchLocation() {
      if (!locationId) {
        return;
      }

      try {
        const response = await axios.get<LocationResponse>(
          `/api/location/${locationId}`,
        );

        if (!isMounted) {
          return;
        }

        setLocationName(response.data?.data?.name || "");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Error fetching location data:", error);
      }
    }

    fetchLocation();

    return () => {
      isMounted = false;
    };
  }, [locationId]);

  useEffect(() => {
    let isMounted = true;

    async function fetchTransfers() {
      if (!locationId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const response = await axios.get<TransferHistoryResponse>(
          "/api/history/transfer",
          {
            params: {
              page: currentPage,
              limit: PAGE_SIZE,
              location_id: locationId,
              range: buildRangeRequestValue(currentRange),
              status: currentStatus || undefined,
              start_date: currentStartDate || undefined,
              end_date: currentEndDate || undefined,
            },
          },
        );

        if (!isMounted) {
          return;
        }

        const payload = response.data?.data;
        const transferHistory = payload?.transfer_history ?? [];

        setTransactions(transferHistory);
        setSummary({
          transactionIn: Number(payload?.transaction_in ?? 0),
          transactionOut: Number(payload?.transaction_out ?? 0),
          countOutTransaction: Number(payload?.count_out_transaction ?? 0),
          accountBalance: Number(payload?.account_balance ?? 0),
        });
        setPagination(
          payload?.page ?? {
            number_page: currentPage,
            total_page: 1,
            total_data: transferHistory.length,
          },
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Error fetching transfer history:", error);
        setTransactions([]);
        setSummary({
          transactionIn: 0,
          transactionOut: 0,
          countOutTransaction: 0,
          accountBalance: 0,
        });
        setPagination({
          number_page: currentPage,
          total_page: 1,
          total_data: 0,
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchTransfers();

    return () => {
      isMounted = false;
    };
  }, [
    currentPage,
    currentRange,
    currentStatus,
    currentStartDate,
    currentEndDate,
    locationId,
  ]);

  const refreshTransfers = async () => {
    if (!locationId) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.get<TransferHistoryResponse>(
        "/api/history/transfer",
        {
          params: {
            page: currentPage,
            limit: PAGE_SIZE,
            location_id: locationId,
            range: buildRangeRequestValue(currentRange),
            status: currentStatus || undefined,
            start_date: currentStartDate || undefined,
            end_date: currentEndDate || undefined,
          },
        },
      );

      const payload = response.data?.data;
      const transferHistory = payload?.transfer_history ?? [];

      setTransactions(transferHistory);
      setSummary({
        transactionIn: Number(payload?.transaction_in ?? 0),
        transactionOut: Number(payload?.transaction_out ?? 0),
        countOutTransaction: Number(payload?.count_out_transaction ?? 0),
        accountBalance: Number(payload?.account_balance ?? 0),
      });
      setPagination(
        payload?.page ?? {
          number_page: currentPage,
          total_page: 1,
          total_data: transferHistory.length,
        },
      );
    } catch (error) {
      console.error("Error fetching transfer history:", error);
      setTransactions([]);
      setSummary({
        transactionIn: 0,
        transactionOut: 0,
        countOutTransaction: 0,
        accountBalance: 0,
      });
      setPagination({
        number_page: currentPage,
        total_page: 1,
        total_data: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.total_page) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("page", String(page));
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  const handleRangeChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (value) {
      nextParams.set("range", value);
    } else {
      nextParams.delete("range");
    }

    nextParams.set("page", "1");
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  const handleStatusChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (value) {
      nextParams.set("status", value);
    } else {
      nextParams.delete("status");
    }

    nextParams.set("page", "1");
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  const handleDateApply = (dates: { start: string; end: string }) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (dates.start) {
      nextParams.set("start_date", dates.start);
    } else {
      nextParams.delete("start_date");
    }

    if (dates.end) {
      nextParams.set("end_date", dates.end);
    } else {
      nextParams.delete("end_date");
    }

    nextParams.set("page", "1");
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  const handleExportAll = async () => {
    try {
      const response = await axios.get<TransferHistoryResponse>(
        "/api/history/transfer",
        {
          params: {
            page: 1,
            limit: pagination.total_data || 1000,
            location_id: locationId,
            range: buildRangeRequestValue(currentRange),
            status: currentStatus || undefined,
            start_date: currentStartDate || undefined,
            end_date: currentEndDate || undefined,
          },
        },
      );

      const payload = response.data?.data;
      const transferHistory = payload?.transfer_history ?? [];

      const rows = transferHistory.map((item) => ({
        Tanggal: item.tanggal,
        Waktu: item.waktu,
        "Jumlah Nominal": new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(Number(item.jumlah_nominal ?? 0)),
        Lokasi: item.location || locationName || locationId,
        Status: item.transfer_status === "in" ? "Masuk" : "Keluar",
        "Transaction ID": item.transaction_id || "",
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Transfer");

      const fileScope = locationName || locationId || "ALL";
      const rangeLabel =
        currentStartDate && currentEndDate
          ? currentStartDate === currentEndDate
            ? currentStartDate
            : `${currentStartDate} sd ${currentEndDate}`
          : getRangeLabel(currentRange);

      XLSX.writeFile(
        workbook,
        `MUSLA_TRANS_UTAMA - TRANSFER - ${fileScope} - ${rangeLabel}.xlsx`,
      );
    } catch (error) {
      console.error("Error exporting transfer data:", error);
    }
  };

  const handleTopUpSubmit = async ({
    amount,
    buktiTransferFile,
  }: {
    amount: number;
    buktiTransferFile: File;
  }) => {
    if (!locationId) {
      setToastType("error");
      setToastMessage("Location tidak ditemukan");
      setShowToast(true);
      return;
    }

    try {
      setIsTopUpSubmitting(true);

      const meRes = await axios.get<{ data?: { id?: string } }>("/api/auth/me");
      const userId = meRes.data?.data?.id;

      if (!userId) {
        setToastType("error");
        setToastMessage("User tidak ditemukan. Silakan login ulang");
        setShowToast(true);
        setIsTopUpSubmitting(false);
        return;
      }

      const buktiTransfer = await readFileAsDataUrl(buktiTransferFile);

      const response = await axios.post(`/api/finance/transfer/${locationId}`, {
        amount,
        bukti_transfer: buktiTransfer,
        user_id: userId,
      });

      setIsTopUpModalOpen(false);
      setToastType("success");
      setToastMessage(response.data?.message || "Top up berhasil disimpan");
      setShowToast(true);

      await refreshTransfers();
    } catch (error) {
      console.error("Error submitting top up:", error);
      setToastType("error");
      setToastMessage("Gagal menyimpan top up");
      setShowToast(true);
    } finally {
      setIsTopUpSubmitting(false);
    }
  };

  const handleViewOutgoingDetail = async (transactionId: string | null) => {
    if (!transactionId) {
      return;
    }

    try {
      setIsDetailLoading(true);
      const response = await axios.get<{
        statusCode: number;
        data: TransactionDetail;
      }>(`/api/history/transaction/${transactionId}`);

      setSelectedDetail(response.data?.data ?? null);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Error fetching transaction detail:", error);
      setSelectedDetail(null);
      setIsDetailModalOpen(true);
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-full pb-10">
      <PageHeader
        title={
          locationName ? `Riwayat Transfer ${locationName}` : "Riwayat Transfer"
        }
        extraActions={
          <div className="w-32">
            <Select
              value={currentRange}
              onChange={(e) => handleRangeChange(e.target.value)}
              options={[
                { value: "all", label: "Semua" },
                { value: "monthly", label: "Bulanan" },
                { value: "daily", label: "Hari ini" },
              ]}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Uang Masuk"
          value={formatRupiah(summary.transactionIn)}
          label={getRangeLabel(currentRange)}
        />
        <StatCard
          title="Uang Keluar"
          value={formatRupiah(summary.transactionOut)}
          label={getRangeLabel(currentRange)}
        />
        <StatCard
          title="Sisa Uang"
          value={formatRupiah(summary.accountBalance)}
          label={getRangeLabel(currentRange)}
        />
        <StatCard
          title="Total Transaksi Keluar"
          value={formatNumber(summary.countOutTransaction)}
          label={getRangeLabel(currentRange)}
        />
      </div>

      <Card
        title="Data Riwayat Transfer"
        noPadding
        headerAction={
          <div className="flex items-center gap-3">
            <Button
              variant="white"
              className="px-6 py-2 text-xs font-bold h-10 border-gray-100 min-w-30"
              icon={<Export size={18} weight="bold" />}
              onClick={handleExportAll}
            >
              Export
            </Button>
            <Button
              variant="white"
              className="px-6 py-2 text-xs font-bold h-10 border-gray-100 min-w-30"
              onClick={() => setIsDateModalOpen(true)}
              icon={<CaretDown size={14} weight="bold" />}
              iconPosition="right"
            >
              Tanggal
            </Button>
            <Select
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              options={[
                { value: "", label: "Semua" },
                { value: "in", label: "Masuk" },
                { value: "out", label: "Keluar" },
              ]}
              className="min-w-30"
            />
            <Button
              variant="secondary"
              className="px-6 py-2 text-xs font-bold h-10 border-gray-100 min-w-30"
              icon={<Plus size={14} weight="bold" />}
              onClick={() => setIsTopUpModalOpen(true)}
            >
              Top Up
            </Button>
          </div>
        }
      >
        <div ref={containerRef}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-8 py-5">tanggal</th>
                  <th className="px-4 py-5">Waktu</th>
                  <th className="px-4 py-5">Jumlah Nominal</th>
                  <th className="px-4 py-5">Status</th>
                  <th className="px-8 py-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td colSpan={5} className="px-8 py-5">
                          <div className="h-4 bg-gray-100 rounded-lg w-full" />
                        </td>
                      </tr>
                    ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-8 py-10 text-center text-gray-400 text-sm"
                    >
                      Tidak ada transaksi
                    </td>
                  </tr>
                ) : (
                  transactions.map((row, index) => {
                    const menuId =
                      row.transaction_id ||
                      `${row.tanggal}-${row.waktu}-${index}`;
                    const receiptImage = buildReceiptImageSrc(row.bukti_tf);

                    return (
                      <tr
                        key={menuId}
                        className="group hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-8 py-4 text-xs font-medium text-gray-600">
                          {formatDisplayDate(row.tanggal)}
                        </td>
                        <td className="px-4 py-4 text-xs font-medium text-gray-600">
                          {row.waktu}
                        </td>
                        <td className="px-4 py-4 text-xs font-medium text-gray-600">
                          {formatRupiah(Number(row.jumlah_nominal ?? 0))}
                        </td>
                        <td className="px-4 py-4">
                          <Badge
                            variant={
                              row.transfer_status === "in"
                                ? "success"
                                : "danger"
                            }
                            className="rounded-lg px-3 py-1 text-[10px] font-bold"
                          >
                            {row.transfer_status === "in" ? "Masuk" : "Keluar"}
                          </Badge>
                        </td>
                        <td className="px-8 py-4 text-center relative">
                          {row.transfer_status === "out" ? (
                            <button
                              onClick={() =>
                                void handleViewOutgoingDetail(
                                  row.transaction_id,
                                )
                              }
                              className="p-2.5 text-gray-400 hover:text-gray-900 border border-gray-100 rounded-xl hover:bg-white transition-all inline-flex items-center justify-center shadow-sm"
                            >
                              <Eye size={18} weight="bold" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setOpenRowMenuId(
                                    openRowMenuId === menuId ? null : menuId,
                                  );
                                }}
                                className={`p-2 rounded-xl transition-all border border-gray-100 shadow-sm hover:text-gray-900 ${
                                  openRowMenuId === menuId
                                    ? "bg-gray-50 text-gray-900"
                                    : "text-gray-400 hover:bg-gray-50"
                                }`}
                              >
                                <DotsThreeVertical size={20} weight="bold" />
                              </button>

                              {openRowMenuId === menuId && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200 text-left">
                                  {receiptImage && (
                                    <button
                                      onClick={() => {
                                        setSelectedReceiptImage(receiptImage);
                                        setIsReceiptModalOpen(true);
                                        setOpenRowMenuId(null);
                                      }}
                                      className="w-full text-left px-4 py-3 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50"
                                    >
                                      Lihat Bukti Transfer
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      router.push(
                                        `/finance/transaksi/${locationId}/edit/${row.transaction_id || menuId}`,
                                      );
                                    }}
                                    className="w-full text-left px-4 py-3 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    Edit
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && transactions.length > 0 && (
            <Pagination
              currentPage={pagination.number_page}
              totalPages={pagination.total_page}
              onPageChange={handlePageChange}
              totalData={pagination.total_data}
              showingData={transactions.length}
            />
          )}
        </div>
      </Card>

      <DateFilterModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onApply={handleDateApply}
        initialDates={{
          start: currentStartDate,
          end: currentEndDate,
        }}
      />

      <BuktiTransaksiModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        isLoading={isDetailLoading}
        data={selectedDetail}
      />

      <BuktiTransferReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedReceiptImage(null);
        }}
        imageSrc={selectedReceiptImage}
      />

      <FinanceTopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        onSubmit={handleTopUpSubmit}
        isSubmitting={isTopUpSubmitting}
        locationName={locationName}
      />

      <Toast
        isVisible={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}