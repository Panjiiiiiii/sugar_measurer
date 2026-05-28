"use client";

import React from "react";
import {
  CaretDown,
  ArrowUp,
  ArrowDown,
  PencilSimple,
  CaretRight,
  X
} from "@phosphor-icons/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import Link from "next/link";

const chartData = [
  { time: "07:00", value: 500 },
  { time: "08:00", value: 700 },
  { time: "09:00", value: 450 },
  { time: "10:00", value: 350 },
  { time: "11:00", value: 600 },
  { time: "12:00", value: 580 },
  { time: "13:00", value: 620 },
  { time: "14:00", value: 550 },
  { time: "15:00", value: 850 },
  { time: "16:00", value: 680 },
  { time: "18:00", value: 480, highlight: true },
  { time: "19:00", value: 650 },
  { time: "20:00", value: 420 },
  { time: "21:00", value: 720 },
  { time: "22:00", value: 530 },
];

const locations = [
  { name: "Malang", available: "Rp 100.000.000", price: "Rp 7.800/kg", paid: "25 Ton", queue: "50 Ton", in: "Rp 250.000", out: "Rp 50.000" },
  { name: "Blitar", available: "Rp 100.000.000", price: "Rp 7.800/kg", paid: "25 Ton", queue: "50 Ton", in: "Rp 250.000", out: "Rp 50.000" },
  { name: "Kediri 1", available: "Rp 100.000.000", price: "Rp 7.800/kg", paid: "25 Ton", queue: "50 Ton", in: "Rp 250.000", out: "Rp 50.000" },
  { name: "Kediri 2", available: "Rp 100.000.000", price: "Rp 7.800/kg", paid: "25 Ton", queue: "50 Ton", in: "Rp 250.000", out: "Rp 50.000" },
];

export default function FinanceDashboard() {
  const [dateFilter, setDateFilter] = React.useState("Today");
  const [isDateDropdownOpen, setIsDateDropdownOpen] = React.useState(false);
  const [selectedLocation, setSelectedLocation] = React.useState("Malang");
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [priceInput, setPriceInput] = React.useState("");

  const dateOptions = ["Today", "Week", "Month", "Year", "All"];

  return (
    <>
      {/* Edit Harga Tebu Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" 
            onClick={() => setIsEditModalOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="pt-8 px-8 flex items-center justify-between">
              <div className="w-6"></div> {/* Spacer */}
              <h2 className="text-xl font-bold text-gray-900">Edit Harga Tebu</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            {/* Modal Body */}
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
                  onClick={() => {
                    // Logic to save price
                    setIsEditModalOpen(false);
                  }}
                  className="flex-1 px-6 py-4 bg-[#00A859] text-white rounded-2xl text-sm font-bold hover:bg-[#008F4C] shadow-lg shadow-green-500/20 transition-all"
                >
                  Simpan
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
            {dateFilter}
            <CaretDown 
              size={16} 
              weight="bold" 
              className={`transition-transform duration-200 ${isDateDropdownOpen ? "rotate-180" : ""}`} 
            />
          </button>

          {isDateDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsDateDropdownOpen(false)}
              ></div>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                {dateOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setDateFilter(option);
                      setIsDateDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      dateFilter === option 
                        ? "bg-blue-50 text-[#0095FF] font-bold" 
                        : "text-gray-600 hover:bg-gray-50 font-semibold"
                    }`}
                  >
                    {option}
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
            value="Rp 1.000.000.000"
            trend="+ 8%"
            trendType="up"
            tag={dateFilter}
          />
          <SummaryCard
            label="Total Tonase"
            value="1.000 Kg"
            trend="+ 12%"
            trendType="up"
            tag={dateFilter}
          />
          <SummaryCard
            label="Total Transaksi Keluar"
            value="5.000"
            trend="- 4%"
            trendType="down"
            tag={dateFilter}
          />
        </div>

        {/* Chart Section */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">Total Tonase</h2>
              <span className="px-3 py-1 bg-blue-50 text-[#0095FF] text-xs font-bold rounded-lg">{dateFilter}</span>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                suppressHydrationWarning
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all min-w-[120px] justify-between"
              >
                {selectedLocation}
                <CaretDown 
                  size={14} 
                  weight="bold" 
                  className={`transition-transform duration-200 ${isLocationDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isLocationDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsLocationDropdownOpen(false)}
                  ></div>
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    {["Malang", "Blitar", "Kediri 1", "Kediri 2"].map((loc) => (
                      <button
                        key={loc}
                        onClick={() => {
                          setSelectedLocation(loc);
                          setIsLocationDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          selectedLocation === loc 
                            ? "bg-blue-50 text-[#0095FF] font-bold" 
                            : "text-gray-600 hover:bg-gray-50 font-semibold"
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                />
                <Tooltip 
                  shared={false}
                  cursor={false}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px'
                  }}
                  labelStyle={{
                    color: '#111827',
                    fontWeight: '800',
                    marginBottom: '4px',
                    fontSize: '12px',
                    display: 'block'
                  }}
                  itemStyle={{
                    color: '#0095FF',
                    fontWeight: '800',
                    fontSize: '14px',
                    padding: '0'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  barSize={24}
                  isAnimationActive={false}
                  shape={<CustomBar />}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Location Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {locations.map((loc) => (
            <LocationCard 
              key={loc.name} 
              {...loc} 
              tag={dateFilter} 
              onEdit={() => setIsEditModalOpen(true)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function CustomBar(props: any) {
  const { x, y, width, height } = props;

  return (
    <g className="group cursor-pointer">
      {/* Gray Base Bar */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#F3F4F6"
        rx={6}
      />
      {/* Blue Rising Overlay */}
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

function SummaryCard({ label, value, trend, trendType, tag }: { label: string; value: string; trend: string; trendType: 'up' | 'down'; tag: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm space-y-4 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="px-3 py-1 bg-blue-50 text-[#0095FF] text-[10px] font-bold rounded-lg w-fit">{tag}</span>
      </div>
      <div className="space-y-1 min-w-0">
        <h3 className="text-xl font-bold text-gray-900 truncate" title={value}>{value}</h3>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-400 truncate">{label}</span>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
            trendType === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {trendType === 'up' ? <ArrowUp size={10} weight="bold" /> : <ArrowDown size={10} weight="bold" />}
            {trend}
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationCard({ name, available, price, paid, queue, in: txIn, out: txOut, tag, onEdit }: any) {
  const slug = name.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col min-w-0">
      <div className="p-6 space-y-6 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-gray-900 truncate">{name}</h3>
          <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-lg shrink-0">{tag}</span>
        </div>

        <div className="grid grid-cols-2 gap-y-6">
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-400">Available Balance</span>
            <p className="text-base font-bold text-gray-900">{available}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-400">Harga Tebu</span>
            <div className="flex items-center gap-2">
              <p className="text-base font-bold text-gray-900">{price}</p>
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
            <p className="text-base font-bold text-gray-900">{paid}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-400">Queue Tonase</span>
            <p className="text-base font-bold text-gray-900">{queue}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-400">Transaction in</span>
            <p className="text-base font-bold text-gray-900">{txIn}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-400">Transaction out</span>
            <p className="text-base font-bold text-gray-900">{txOut}</p>
          </div>
        </div>
      </div>

      <Link 
        href={`/finance/timbangan/${slug}`}
        className="w-full px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between group hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-bold text-gray-900">Lihat detail transaksi</span>
        <CaretRight size={16} weight="bold" className="text-gray-400 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
