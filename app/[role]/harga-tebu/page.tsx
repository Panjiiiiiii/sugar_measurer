"use client";

import React, { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { isAxiosError } from "axios";
import axios from "@/lib/axios";
import { ArrowUp, ArrowDown, CaretDown } from "@phosphor-icons/react";
import { Card, Badge, Pagination, Button, Select } from "@/components/ui";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DateFilterModal } from "@/components/dashboard/DateFilterModal";

interface SugarLogItem {
  id: string;
  created_at: string;
  location_id: string;
  location_name: string;
  old_price: number | null;
  new_price: number;
  changed_by_name: string | null;
  changed_by_role: string | null;
}

interface PaginationMeta {
  per_page: number;
  number_page: number;
  total_page: number;
  total_data: number;
}

interface SugarLogResponse {
  statusCode: number;
  data: SugarLogItem[];
  page: PaginationMeta;
}

const PAGE_SIZE = 20;
const COLUMN_COUNT = 6;

const ROLE_LABEL: Record<string, string> = {
  finance: "Finance",
  manager: "Manager",
  operator: "Operator",
  master: "Master",
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

// The date picker gives YYYY-MM-DD; interpret it as a whole day in WIB (UTC+7).
function toWibStart(date: string) {
  return date ? `${date}T00:00:00.000+07:00` : undefined;
}

function toWibEnd(date: string) {
  return date ? `${date}T23:59:59.999+07:00` : undefined;
}

function PriceDiff({ oldPrice, newPrice }: { oldPrice: number | null; newPrice: number }) {
  if (oldPrice === null) {
    return (
      <Badge variant="gray" className="rounded-lg px-3 py-1 text-[10px] font-bold">
        Harga awal
      </Badge>
    );
  }

  const diff = newPrice - oldPrice;
  if (diff > 0) {
    return (
      <Badge variant="success" className="rounded-lg px-3 py-1 text-[10px] font-bold gap-1">
        <ArrowUp size={12} weight="bold" />
        {formatRupiah(diff)}
      </Badge>
    );
  }
  if (diff < 0) {
    return (
      <Badge variant="danger" className="rounded-lg px-3 py-1 text-[10px] font-bold gap-1">
        <ArrowDown size={12} weight="bold" />
        {formatRupiah(Math.abs(diff))}
      </Badge>
    );
  }
  return (
    <Badge variant="gray" className="rounded-lg px-3 py-1 text-[10px] font-bold">
      {formatRupiah(0)}
    </Badge>
  );
}

function HargaTebuContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page") || 1);
  const currentLocationId = searchParams.get("location_id") || "";
  const currentStartDate = searchParams.get("start") || "";
  const currentEndDate = searchParams.get("end") || "";

  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [logs, setLogs] = useState<SugarLogItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    per_page: PAGE_SIZE,
    number_page: 1,
    total_page: 1,
    total_data: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  useEffect(() => {
    let isActive = true;

    (async () => {
      try {
        const res = await axios.get("/api/location", { params: { page: 1, limit: 100 } });
        if (!isActive) return;
        const data = res.data?.data ?? [];
        setLocations(data.map((l: { id: string; name: string }) => ({ id: l.id, name: l.name })));
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      }
    })();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<SugarLogResponse>("/api/finance/sugar-log", {
          params: {
            page: currentPage,
            limit: PAGE_SIZE,
            location_id: currentLocationId || undefined,
            start: toWibStart(currentStartDate),
            end: toWibEnd(currentEndDate),
          },
        });
        if (!isActive) return;

        const data = response.data?.data ?? [];
        setLogs(data);
        setPagination(
          response.data?.page ?? {
            per_page: PAGE_SIZE,
            number_page: currentPage,
            total_page: 1,
            total_data: data.length,
          },
        );
      } catch (err) {
        console.error("Error fetching sugar price log:", err);
        if (!isActive) return;
        setLogs([]);
        const status = isAxiosError(err) ? err.response?.status : undefined;
        setError(
          status === 401 || status === 403
            ? "Anda tidak memiliki akses ke riwayat harga tebu."
            : "Gagal memuat riwayat harga tebu. Silakan coba lagi.",
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [currentPage, currentLocationId, currentStartDate, currentEndDate, reloadKey]);

  const pushParams = (update: (params: URLSearchParams) => void) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    update(nextParams);
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.total_page) return;
    pushParams((p) => p.set("page", String(page)));
  };

  const handleLocationChange = (value: string) => {
    pushParams((p) => {
      if (value) p.set("location_id", value);
      else p.delete("location_id");
      p.set("page", "1");
    });
  };

  const handleDateApply = (dates: { start: string; end: string }) => {
    pushParams((p) => {
      if (dates.start) p.set("start", dates.start);
      else p.delete("start");
      if (dates.end) p.set("end", dates.end);
      else p.delete("end");
      p.set("page", "1");
    });
  };

  return (
    <div className="flex flex-col w-full max-w-full pb-10">
      <PageHeader title="Riwayat Harga Tebu" />

      <Card
        title="Data Perubahan Harga"
        noPadding
        headerAction={
          <div className="flex items-center gap-3">
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
              value={currentLocationId}
              onChange={(e) => handleLocationChange(e.target.value)}
              options={[
                { value: "", label: "Semua Lokasi" },
                ...locations.map((l) => ({ value: l.id, label: l.name })),
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
                <th className="px-8 py-5">Tanggal </th>
                <th className="px-4 py-5">Lokasi</th>
                <th className="px-4 py-5">Harga Lama</th>
                <th className="px-4 py-5">Harga Baru</th>
                <th className="px-4 py-5">Selisih</th>
                <th className="px-8 py-5">Diubah oleh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={COLUMN_COUNT} className="px-8 py-5">
                        <div className="h-4 bg-gray-100 rounded-lg w-full"></div>
                      </td>
                    </tr>
                  ))
              ) : error ? (
                <tr>
                  <td
                    colSpan={COLUMN_COUNT}
                    className="px-8 py-10 text-center text-sm font-medium text-red-400"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <span>{error}</span>
                      <Button
                        variant="white"
                        className="px-6 py-2 text-xs font-bold h-10 border-gray-100"
                        onClick={() => setReloadKey((k) => k + 1)}
                      >
                        Coba lagi
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={COLUMN_COUNT} className="px-8 py-10 text-center text-gray-400 text-sm">
                    Belum ada perubahan harga
                  </td>
                </tr>
              ) : (
                logs.map((row) => (
                  <tr key={row.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4 text-xs font-medium text-gray-600">
                      {formatDateTime(row.created_at)}
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600">
                      {row.location_name}
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600">
                      {row.old_price === null ? "-" : formatRupiah(row.old_price)}
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600">
                      {formatRupiah(row.new_price)}
                    </td>
                    <td className="px-4 py-4">
                      <PriceDiff oldPrice={row.old_price} newPrice={row.new_price} />
                    </td>
                    <td className="px-8 py-4">
                      {row.changed_by_name ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-600">
                            {row.changed_by_name}
                          </span>
                          <span className="text-[11px] font-medium text-gray-400">
                            {ROLE_LABEL[row.changed_by_role ?? ""] ?? row.changed_by_role ?? ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-gray-400">Sistem</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && !error && logs.length > 0 && (
          <Pagination
            currentPage={pagination.number_page}
            totalPages={pagination.total_page}
            onPageChange={handlePageChange}
            totalData={pagination.total_data}
            showingData={logs.length}
          />
        )}
      </Card>

      <DateFilterModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onApply={handleDateApply}
        initialDates={{ start: currentStartDate, end: currentEndDate }}
      />
    </div>
  );
}

export default function HargaTebuPage() {
  return (
    <Suspense fallback={null}>
      <HargaTebuContent />
    </Suspense>
  );
}
