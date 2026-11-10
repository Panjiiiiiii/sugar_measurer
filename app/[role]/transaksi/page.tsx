"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";
import axios from "@/lib/axios";
import { Export, CaretDown, Eye } from "@phosphor-icons/react";
import {
  StatCard,
  Card,
  Badge,
  Pagination,
  Button,
  Select,
} from "@/components/ui";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DateFilterModal } from "@/components/dashboard/DateFilterModal";
import { BuktiTransaksiModal } from "@/components/dashboard/BuktiTransaksiModal";
import { BuktiTransferReceiptModal } from "@/components/dashboard/BuktiTransferReceiptModal";

interface TransactionData {
  id: string | null;
  transaction_date: string;
  loading_in: string;
  amount: number;
  type: "Masuk" | "Keluar";
  bukti_tf: string | null;
}

interface ApiTransactionItem {
  tanggal: string;
  waktu: string;
  bukti_tf: string | null;
  jumlah_nominal: number;
  transfer_status: "in" | "out";
  transaction_id: string | null;
}

interface ApiPaginationMeta {
  number_page: number;
  total_page: number;
  total_data: number;
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

interface ApiHistoryData {
  transaction_in: number;
  transaction_out: number;
  count_out_transaction: number;
  account_balance: number;
  transfer_history: ApiTransactionItem[];
  page: ApiPaginationMeta;
}

interface TransferHistoryResponse {
  statusCode: number;
  data: ApiHistoryData;
}

interface SummaryData {
  transactionIn: number;
  transactionOut: number;
  countOutTransaction: number;
  accountBalance: number;
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
  const date = new Date(value);

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

  return "";
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

  // If it's already a full URL (Supabase Storage), return as-is
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  // Otherwise, extract filename and build relative path for local files
  const fileName = value.split("/").pop()?.trim();

  if (!fileName) {
    return null;
  }

  return `/finance/transfer/${encodeURIComponent(fileName)}`;
}

export default function TransaksiPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleRaw = params.role as string;
  const role = !roleRaw || roleRaw === "undefined" ? "branch" : roleRaw;
  const [authLocationId, setAuthLocationId] = useState<string>("");
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const currentPage = Number(searchParams.get("page") || 1);
  const currentRange = normalizeRangeValue(
    searchParams.get("range") || "monthly",
  );
  const currentStatus = searchParams.get("status") || "";
  const currentStartDate = searchParams.get("start_date") || "";
  const currentEndDate = searchParams.get("end_date") || "";
  const resolvedLocationId = searchParams.get("location_id") || authLocationId;

  useEffect(() => {
    let isActive = true;

    const fetchAuthUser = async () => {
      try {
        const response = await axios.get<{ data?: { location_id?: string | null } }>("/api/auth/me");
        if (!isActive) return;

        setAuthLocationId(response.data?.data?.location_id || "");
      } catch (error) {
        console.error("Error fetching auth user:", error);
        if (isActive) {
          setAuthLocationId("");
        }
      } finally {
        if (isActive) {
          setIsAuthLoaded(true);
        }
      }
    };

    fetchAuthUser();

    return () => {
      isActive = false;
    };
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
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
  const [isBuktiModalOpen, setIsBuktiModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceiptImage, setSelectedReceiptImage] = useState<
    string | null
  >(null);
  const [selectedDetail, setSelectedDetail] =
    useState<TransactionDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!resolvedLocationId) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get<TransferHistoryResponse>(
          "/api/history/transfer",
          {
            params: {
              page: currentPage,
              limit: 10,
              location_id: resolvedLocationId,
              range: buildRangeRequestValue(currentRange),
              status: currentStatus || undefined,
              start_date: currentStartDate || undefined,
              end_date: currentEndDate || undefined,
            },
          },
        );

        const payload = response.data?.data;
        const transferHistory = payload?.transfer_history ?? [];

        setTransactions(
          transferHistory.map((item) => ({
            id: item.transaction_id,
            transaction_date: formatDisplayDate(item.tanggal),
            loading_in: item.waktu,
            amount: Number(item.jumlah_nominal ?? 0),
            type: item.transfer_status === "in" ? "Masuk" : "Keluar",
            bukti_tf: item.bukti_tf,
          })),
        );

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

    fetchTransactions();
  }, [
    currentPage,
    currentRange,
    currentStatus,
    currentStartDate,
    currentEndDate,
    resolvedLocationId,
  ]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.total_page) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("page", String(page));
    router.push(`/${role}/transaksi?${nextParams.toString()}`);
  };

  const handleRangeChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (value) {
      nextParams.set("range", value);
    } else {
      nextParams.delete("range");
    }

    nextParams.set("page", "1");
    router.push(`/${role}/transaksi?${nextParams.toString()}`);
  };

  const handleStatusChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (value) {
      nextParams.set("status", value);
    } else {
      nextParams.delete("status");
    }

    nextParams.set("page", "1");
    router.push(`/${role}/transaksi?${nextParams.toString()}`);
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
    router.push(`/${role}/transaksi?${nextParams.toString()}`);
  };

  const handleViewOutgoingTransaction = async (
    transactionId: string | null,
  ) => {
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
      setIsBuktiModalOpen(true);
    } catch (error) {
      console.error("Error fetching transaction detail:", error);
      setSelectedDetail(null);
      setIsBuktiModalOpen(true);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleExportAll = async () => {
    try {
      if (!resolvedLocationId) {
        return;
      }

      const response = await axios.get<TransferHistoryResponse>(
        "/api/history/transfer",
        {
          params: {
            page: 1,
            limit: pagination.total_data || 1000,
            location_id: resolvedLocationId,
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
        Status: item.transfer_status === "in" ? "Masuk" : "Keluar",
      }));
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Transaksi");
      const getExportRangeLabel = () => {
        if (currentStartDate && currentEndDate) {
          if (currentStartDate === currentEndDate) {
            return currentStartDate;
          }
          return `${currentStartDate} sd ${currentEndDate}`;
        }
        return "ALL";
      };

      const fileName = `MUSLA_TRANS_UTAMA - TRANSAKSI - ${getExportRangeLabel()}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Error exporting transaction data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-full pb-10">
      <PageHeader
        title="Riwayat Transaksi"
        extraActions={
          <div className="w-32">
            <Select
              value={currentRange}
              onChange={(e) => handleRangeChange(e.target.value)}
              options={[
                { value: "all", label: "Semua" },
                { value: "monthly", label: "Bulanan" },
                { value: "weekly", label: "Mingguan" },
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
        title="Data Riwayat Transaksi"
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
          </div>
        }
      >
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
                  .map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-5">
                        <div className="h-4 bg-gray-100 rounded-lg w-full"></div>
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
                transactions.map((row, index) => (
                  <tr
                    key={`${row.id || `${row.transaction_date}-${row.amount}`}-${index}`}
                    className="group hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-8 py-4 text-xs font-medium text-gray-600">
                      {row.transaction_date}
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600">
                      {row.loading_in}
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600">
                      {formatRupiah(row.amount)}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant={row.type === "Masuk" ? "success" : "danger"}
                        className="rounded-lg px-3 py-1 text-[10px] font-bold"
                      >
                        {row.type}
                      </Badge>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <button
                        onClick={() => {
                          if (row.type === "Keluar") {
                            void handleViewOutgoingTransaction(row.id);
                            return;
                          }

                          setSelectedReceiptImage(
                            buildReceiptImageSrc(row.bukti_tf),
                          );
                          setIsReceiptModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-900 border border-gray-100 rounded-xl hover:bg-white transition-all inline-flex items-center justify-center"
                      >
                        <Eye size={18} weight="bold" />
                      </button>
                    </td>
                  </tr>
                ))
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
        isOpen={isBuktiModalOpen}
        onClose={() => setIsBuktiModalOpen(false)}
        isLoading={isDetailLoading}
        data={selectedDetail}
      />
      <BuktiTransferReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        imageSrc={selectedReceiptImage}
      />
    </div>
  );
}
