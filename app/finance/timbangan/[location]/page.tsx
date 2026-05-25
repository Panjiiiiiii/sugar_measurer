"use client";

import React from "react";
import { useParams } from "next/navigation";
import {
  CaretDown,
  Export,
  PencilSimple,
  CaretLeft,
  CaretRight,
  DotsThreeVertical,
  X,
  Funnel,
  ArrowRight,
  CalendarBlank
} from "@phosphor-icons/react";

const antrianData = [
  { date: "01/01/2026", time: "15:00", nopol: "N 1234 AC", supir: "Budi", ownership: "Petani", customer: "Abah", bruto: "100 kg", status: "In Queue" },
  { date: "02/04/2026", time: "15:00", nopol: "N 1234 AC", supir: "Budi", ownership: "Private", customer: "Abah", bruto: "100 kg", status: "In Queue" },
  { date: "03/04/2026", time: "15:00", nopol: "N 1234 AC", supir: "Budi", ownership: "Petani", customer: "Abah", bruto: "100 kg", status: "In Queue" },
  { date: "04/04/2026", time: "15:00", nopol: "N 1234 AC", supir: "Budi", ownership: "Private", customer: "Abah", bruto: "100 kg", status: "In Queue" },
];

const riwayatData = Array(11).fill({
  date: "01/01/2026",
  in: "15:00",
  out: "16:00",
  nopol: "N 1234 AC",
  supir: "Budi",
  ownership: "Petani",
  customer: "Abah",
  bruto: "100 kg",
  tarre: "25 kg",
  netto: "10 kw"
});

export default function TimbanganLocationPage() {
  const params = useParams();
  const location = params.location as string;
  const locationName = location.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);
  const [priceInput, setPriceInput] = React.useState("");

  // Filter States
  const [startDate, setStartDate] = React.useState("2026-03-11");
  const [endDate, setEndDate] = React.useState("2026-04-11");
  const [customer, setCustomer] = React.useState("Abah");
  const [ownership, setOwnership] = React.useState("Private");
  const [status, setStatus] = React.useState("Paid");

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

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" 
            onClick={() => setIsFilterModalOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="pt-6 px-8 flex items-center justify-between">
              <div className="w-6"></div> {/* Spacer */}
              <h2 className="text-lg font-bold text-gray-900">Filter</h2>
              <button 
                onClick={() => setIsFilterModalOpen(false)}
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-8 pb-8 pt-2 space-y-4">
              {/* Date Range Row */}
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

              {/* Customer */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-900 ml-1">Customer</label>
                <input 
                  type="text"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-[12px] font-medium text-gray-900 focus:outline-none focus:border-[#00A859] transition-colors shadow-sm"
                />
              </div>

              {/* Ownership */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-900 ml-1">Ownership</label>
                <div className="relative">
                  <select 
                    value={ownership}
                    onChange={(e) => setOwnership(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-[12px] font-medium text-gray-900 focus:outline-none focus:border-[#00A859] transition-colors appearance-none shadow-sm cursor-pointer"
                  >
                    <option value="Private">Private</option>
                    <option value="Petani">Petani</option>
                  </select>
                  <CaretDown size={14} weight="bold" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-900 ml-1">Status</label>
                <div className="relative">
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-[12px] font-medium text-gray-900 focus:outline-none focus:border-[#00A859] transition-colors appearance-none shadow-sm cursor-pointer"
                  >
                    <option value="Paid">Paid</option>
                    <option value="In Queue">In Queue</option>
                  </select>
                  <CaretDown size={14} weight="bold" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Terapkan Button */}
              <button 
                onClick={() => setIsFilterModalOpen(false)}
                className="w-full py-3.5 bg-[#00A859] text-white rounded-2xl text-sm font-bold hover:bg-[#008F4C] shadow-lg shadow-green-500/20 transition-all mt-2"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-8 space-y-8">
        {/* Page Header */}
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard label="In Queue" value="4 Truk" tag="Today" />
          <SummaryCard label="Paid" value="Rp 600.000.000" tag="Today" />
          <SummaryCard label="Unpaid" value="Rp 20.000.000" tag="Today" />
          <SummaryCard 
            label="Harga tebu" 
            value="Rp 7.500" 
            showEdit 
            onEdit={() => setIsEditModalOpen(true)}
          />
        </div>

        {/* Antrian Timbangan */}
        <section className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-8 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">Antrian Timbangan</h2>
              <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-lg">Today</span>
            </div>
            <button suppressHydrationWarning className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
              <Export size={18} weight="bold" />
              Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left border-collapse">
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
                {antrianData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.date}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.time}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.nopol}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.supir}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.ownership}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.customer}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.bruto}</td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-blue-50 text-[#0095FF] text-[10px] font-bold rounded-lg uppercase">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Riwayat Timbangan */}
        <section className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-8 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">Riwayat Timbangan</h2>
              <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-lg">Today</span>
            </div>
            <button suppressHydrationWarning className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
              <Export size={18} weight="bold" />
              Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-left border-collapse">
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {riwayatData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.date}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.in}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.out}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.nopol}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.supir}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.ownership}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.customer}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.bruto}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.tarre}</td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-600">{row.netto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-8 border-t border-gray-50 flex flex-col items-center gap-6">
            <p className="text-xs font-bold text-gray-400">20 data show from 100 data</p>
            <div className="flex items-center gap-3">
              <button suppressHydrationWarning className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all group">
                <CaretLeft size={18} weight="bold" className="text-gray-400 group-hover:text-gray-900" />
                Previous
              </button>
              <div className="flex items-center gap-2">
                <button suppressHydrationWarning className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-[#0095FF] text-sm font-bold border border-blue-100">1</button>
                <button suppressHydrationWarning className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-600 text-sm font-bold">2</button>
                <button suppressHydrationWarning className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-600 text-sm font-bold">3</button>
                <span className="w-12 h-12 flex items-center justify-center text-gray-400">...</span>
                <button suppressHydrationWarning className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-600 text-sm font-bold">55</button>
              </div>
              <button suppressHydrationWarning className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all group">
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

function SummaryCard({ label, value, tag, showEdit, onEdit }: { label: string; value: string; tag?: string; showEdit?: boolean; onEdit?: () => void }) {
  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm space-y-4 min-w-0">
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
        <h3 className="text-lg font-bold text-gray-900 truncate" title={value}>{value}</h3>
        <span className="text-[11px] font-bold text-gray-400 block truncate">{label}</span>
      </div>
    </div>
  );
}
