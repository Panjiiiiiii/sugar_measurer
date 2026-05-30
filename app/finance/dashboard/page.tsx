"use client";

import React from "react";
import {
  CaretDown,
  ArrowUp,
  ArrowDown,
  PencilSimple,
  CaretRight,
  X,
} from "@phosphor-icons/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import axios from "axios";

// ── Types ──────────────────────────────────────────────────────────────────────

type FilterType = "today" | "week" | "month" | "year" | "all";

interface LocationCard {
  id: string;
  name: string;
  sugar_price: number;
  account_balance: number;
  paid_tonase: number;
  queue_tonase: number;
  transaction_in: number;
  transaction_out: number;
}

interface DashboardData {
  filter: FilterType;
  kpi: {
    total_kas: number;
    total_tonase: number;
    total_transaksi_keluar: number;
  };
  chart: {
    location_id: string | null;
    data: { label: string; tonase: number }[];
  };
  locations: LocationCard[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatKw(value: number) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value / 100) + " Kw";
}

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
  { label: "Today", value: "today" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
  { label: "All", value: "all" },
];

// ── Main Component ─────────────────────────────────────────────────────────────

export default function FinanceDashboard() {
  const [filter, setFilter] = React.useState<FilterType>("today");
  const [isDateDropdownOpen, setIsDateDropdownOpen] = React.useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = React.useState(false);

  // Chart location selector — driven by data from API
  const [selectedChartLocId, setSelectedChartLocId] = React.useState<string | null>(null);

  // Edit harga modal state
  const [editingLoc, setEditingLoc] = React.useState<LocationCard | null>(null);
  const [priceInput, setPriceInput] = React.useState("");
  const [isSavingPrice, setIsSavingPrice] = React.useState(false);

  // Dashboard data
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // ── Fetch dashboard data ───────────────────────────────────────────────────

  const fetchDashboard = React.useCallback(async (f: FilterType, locId: string | null) => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { filter: f };
      if (locId) params.location_id = locId;

      const res = await axios.get("/api/finance/dashboard", { params });
      const result: DashboardData = res.data.data;
      setData(result);

      // Set default chart location ke lokasi pertama kalau belum dipilih
      if (!locId && result.locations.length > 0) {
        setSelectedChartLocId(result.locations[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch saat filter berubah
  React.useEffect(() => {
    fetchDashboard(filter, selectedChartLocId);
  }, [filter]);

  // Fetch ulang saat chart location berubah
  React.useEffect(() => {
    if (selectedChartLocId) {
      fetchDashboard(filter, selectedChartLocId);
    }
  }, [selectedChartLocId]);

  // ── Edit harga tebu ────────────────────────────────────────────────────────

  const handleOpenEdit = (loc: LocationCard) => {
    setEditingLoc(loc);
    setPriceInput(String(loc.sugar_price));
  };

  const handleSavePrice = async () => {
    if (!editingLoc || !priceInput) return;
    setIsSavingPrice(true);
    try {
      await axios.put(`/api/finance/sugar/${editingLoc.id}`, {
        price: Number(priceInput),
      });
      setEditingLoc(null);
      // Refresh data
      fetchDashboard(filter, selectedChartLocId);
    } catch (err) {
      console.error("Failed to update price:", err);
    } finally {
      setIsSavingPrice(false);
    }
  };

  // ── Derived values ─────────────────────────────────────────────────────────

  const selectedChartLocName =
    data?.locations.find((l) => l.id === selectedChartLocId)?.name ?? "Semua";

  const filterLabel = FILTER_OPTIONS.find((o) => o.value === filter)?.label ?? "Today";

  const chartData = data?.chart.data ?? [];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Edit Harga Tebu Modal */}
      {editingLoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setEditingLoc(null)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="pt-8 px-8 flex items-center justify-between">
              <div className="w-6" />
              <h2 className="text-xl font-bold text-gray-900">Edit Harga Tebu</h2>
              <button
                onClick={() => setEditingLoc(null)}
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <div className="p-8 space-y-2 pb-4">
              <p className="text-xs font-semibold text-gray-400">{editingLoc.name}</p>
              <p className="text-sm font-bold text-gray-700">
                Harga saat ini: {formatRupiah(editingLoc.sugar_price)}/kg
              </p>
            </div>

            <div className="px-8 pb-8 space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-900 ml-1">Harga Baru</label>
                <input
                  type="number"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="Masukkan harga baru..."
                  className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]/10 focus:border-[#00A859] transition-all text-sm font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingLoc(null)}
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

      <div className="p-8 space-y-8">
        {/* Date Filter */}
        <div className="relative z-20">
          <button
            onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
            suppressHydrationWarning
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all min-w-[120px] justify-between"
          >
            {filterLabel}
            <CaretDown
              size={16}
              weight="bold"
              className={`transition-transform duration-200 ${isDateDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isDateDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsDateDropdownOpen(false)} />
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setFilter(opt.value);
                      setIsDateDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      filter === opt.value
                        ? "bg-blue-50 text-[#0095FF] font-bold"
                        : "text-gray-600 hover:bg-gray-50 font-semibold"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SummaryCard
            label="Total Kas"
            value={isLoading ? "—" : formatRupiah(data?.kpi.total_kas ?? 0)}
            tag={filterLabel}
            isLoading={isLoading}
          />
          <SummaryCard
            label="Total Tonase"
            value={isLoading ? "—" : formatKw(data?.kpi.total_tonase ?? 0)}
            tag={filterLabel}
            isLoading={isLoading}
          />
          <SummaryCard
            label="Total Transaksi Keluar"
            value={isLoading ? "—" : formatRupiah(data?.kpi.total_transaksi_keluar ?? 0)}
            tag={filterLabel}
            isLoading={isLoading}
          />
        </div>

        {/* Chart Section */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">Total Tonase</h2>
              <span className="px-3 py-1 bg-blue-50 text-[#0095FF] text-xs font-bold rounded-lg">
                {filterLabel}
              </span>
            </div>

            {/* Location dropdown for chart */}
            <div className="relative">
              <button
                onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                suppressHydrationWarning
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all min-w-[120px] justify-between"
              >
                {selectedChartLocName}
                <CaretDown
                  size={14}
                  weight="bold"
                  className={`transition-transform duration-200 ${isLocationDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isLocationDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsLocationDropdownOpen(false)} />
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    {(data?.locations ?? []).map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => {
                          setSelectedChartLocId(loc.id);
                          setIsLocationDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          selectedChartLocId === loc.id
                            ? "bg-blue-50 text-[#0095FF] font-bold"
                            : "text-gray-600 hover:bg-gray-50 font-semibold"
                        }`}
                      >
                        {loc.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="h-[300px] w-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-gray-300 text-sm font-semibold">
                Memuat data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                      padding: "12px 16px",
                    }}
                    labelStyle={{ color: "#111827", fontWeight: "800", fontSize: "12px", display: "block", marginBottom: "4px" }}
                    itemStyle={{ color: "#0095FF", fontWeight: "800", fontSize: "14px", padding: "0" }}
                    formatter={(value: number) => [`${(value / 100).toLocaleString("id-ID", { maximumFractionDigits: 2 })} Kw`, "Tonase"]}
                  />
                  <Bar dataKey="tonase" barSize={24} isAnimationActive={false} shape={<CustomBar />} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Location Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <LocationCardSkeleton key={i} />)
            : (data?.locations ?? []).map((loc) => (
                <LocationCard
                  key={loc.id}
                  loc={loc}
                  tag={filterLabel}
                  onEdit={() => handleOpenEdit(loc)}
                />
              ))}
        </div>
      </div>
    </>
  );
}

// ── Custom Bar ─────────────────────────────────────────────────────────────────

function CustomBar(props: any) {
  const { x, y, width, height } = props;
  return (
    <g className="group cursor-pointer">
      <rect x={x} y={y} width={width} height={height} fill="#F3F4F6" rx={6} />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#0095FF"
        rx={6}
        className="transition-all duration-500 ease-in-out [clip-path:inset(100%_0_0_0)] group-hover:[clip-path:inset(0%_0_0_0)]"
      />
    </g>
  );
}

// ── Summary Card ───────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  tag,
  isLoading,
}: {
  label: string;
  value: string;
  tag: string;
  isLoading: boolean;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm space-y-4 min-w-0">
      <span className="px-3 py-1 bg-blue-50 text-[#0095FF] text-[10px] font-bold rounded-lg w-fit block">
        {tag}
      </span>
      <div className="space-y-1 min-w-0">
        {isLoading ? (
          <div className="h-7 w-40 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <h3 className="text-xl font-bold text-gray-900 truncate" title={value}>
            {value}
          </h3>
        )}
        <span className="text-sm font-medium text-gray-400">{label}</span>
      </div>
    </div>
  );
}

// ── Location Card ──────────────────────────────────────────────────────────────

function LocationCard({
  loc,
  tag,
  onEdit,
}: {
  loc: LocationCard;
  tag: string;
  onEdit: () => void;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col min-w-0">
      <div className="p-6 space-y-6 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-gray-900 truncate">{loc.name}</h3>
          <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-lg shrink-0">
            {tag}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-y-6">
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-400">Available Balance</span>
            <p className="text-base font-bold text-gray-900">
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(loc.account_balance)}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-400">Harga Tebu</span>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-base font-bold text-gray-900">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(loc.sugar_price)}/kg
              </p>
              <button
                onClick={onEdit}
                suppressHydrationWarning
                className="flex items-center gap-1 text-[#0095FF] text-xs font-bold hover:underline"
              >
                <PencilSimple size={14} weight="bold" />
                Edit Harga
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-400">Paid Tonase</span>
            <p className="text-base font-bold text-gray-900">
              {new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(loc.paid_tonase / 100)} Kw
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-400">Queue Tonase</span>
            <p className="text-base font-bold text-gray-900">
              {new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(loc.queue_tonase / 100)} Kw
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-400">Transaction In</span>
            <p className="text-base font-bold text-gray-900">
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(loc.transaction_in)}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-400">Transaction Out</span>
            <p className="text-base font-bold text-gray-900">
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(loc.transaction_out)}
            </p>
          </div>
        </div>
      </div>

      <Link
        href={`/finance/transaksi/${loc.id}`}
        className="w-full px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between group hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-bold text-gray-900">Lihat detail transaksi</span>
        <CaretRight size={16} weight="bold" className="text-gray-400 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}

// ── Location Card Skeleton ─────────────────────────────────────────────────────

function LocationCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-100 rounded-lg" />
          <div className="h-5 w-16 bg-gray-100 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 bg-gray-100 rounded" />
              <div className="h-5 w-32 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
        <div className="h-4 w-40 bg-gray-100 rounded" />
      </div>
    </div>
  );
}