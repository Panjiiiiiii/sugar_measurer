"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CalendarBlank, CaretDown } from "@phosphor-icons/react";

interface NotificationFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: { startDate: string; endDate: string; is_read: string }) => void;
}

export default function NotificationFilterModal({
  isOpen,
  onClose,
  onApply,
}: NotificationFilterModalProps) {
  const [mounted, setMounted] = useState(false);
  const [dates, setDates] = useState({ start: "", end: "" });
  const [status, setStatus] = useState(""); // "" = semua, "0" = belum dibaca, "1" = sudah dibaca

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleReset = () => {
    setDates({ start: "", end: "" });
    setStatus("");
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-[390px] rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative flex items-center justify-center pt-2 pb-6">
          <h2 className="text-lg font-bold text-gray-900">Filter</h2>
          <button
            onClick={onClose}
            className="absolute right-1 top-1.5 p-1 text-gray-900 hover:text-gray-600 transition-colors"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-5">
          {/* Date Picker Group */}
          <div className="flex items-center justify-between gap-3">
            {/* Start Date */}
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-gray-900 ml-0.5">
                Awal tanggal
              </label>
              <div
                className="relative cursor-pointer"
                onClick={(e) => {
                  const input = e.currentTarget.querySelector("input");
                  try { input?.showPicker(); } catch {}
                }}
              >
                <input
                  type="date"
                  className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white font-medium text-xs text-gray-800 focus:outline-none focus:border-green-600 transition-all shadow-sm cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  value={dates.start}
                  onChange={(e) => setDates({ ...dates, start: e.target.value })}
                  onClick={(e) => {
                    e.stopPropagation();
                    try { e.currentTarget.showPicker(); } catch {}
                  }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <CalendarBlank size={16} />
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="self-end pb-3 text-gray-400 font-bold">→</div>

            {/* End Date */}
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-gray-900 ml-0.5">
                Akhir tanggal
              </label>
              <div
                className="relative cursor-pointer"
                onClick={(e) => {
                  const input = e.currentTarget.querySelector("input");
                  try { input?.showPicker(); } catch {}
                }}
              >
                <input
                  type="date"
                  className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white font-medium text-xs text-gray-800 focus:outline-none focus:border-green-600 transition-all shadow-sm cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  value={dates.end}
                  onChange={(e) => setDates({ ...dates, end: e.target.value })}
                  onClick={(e) => {
                    e.stopPropagation();
                    try { e.currentTarget.showPicker(); } catch {}
                  }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <CalendarBlank size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-gray-900 ml-0.5">
              Status Notifikasi
            </label>
            <div className="relative">
              <select
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-white font-medium text-xs text-gray-800 appearance-none focus:outline-none focus:border-green-600 transition-all shadow-sm cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Semua</option>
                <option value="0">Belum dibaca</option>
                <option value="1">Sudah dibaca</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <CaretDown size={16} />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={handleReset}
              className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-200 active:scale-[0.98] transition-all"
            >
              Reset
            </button>
            <button
              onClick={() =>
                onApply({
                  startDate: dates.start,
                  endDate: dates.end,
                  is_read: status,
                })
              }
              className="flex-1 py-3.5 bg-[#009253] text-white rounded-xl font-bold text-xs hover:bg-[#007d47] active:scale-[0.98] transition-all shadow-md"
            >
              Terapkan
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}