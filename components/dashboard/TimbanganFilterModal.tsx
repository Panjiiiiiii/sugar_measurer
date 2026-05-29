"use client";

import React from "react";
import { Modal, Button } from "@/components/ui";
import { CaretDown, CalendarBlank, X, Funnel } from "@phosphor-icons/react";

interface FilterValues {
  startDate: string;
  endDate: string;
  customer: string;
  ownership_type: "farmer" | "private" | "";
  status: "paid" | "unpaid" | "";
}

interface TimbanganFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterValues) => void;
  initialValues?: Partial<FilterValues>;
}

const EMPTY_FILTERS: FilterValues = {
  startDate: "",
  endDate: "",
  customer: "",
  ownership_type: "",
  status: "",
};

export default function TimbanganFilterModal({
  isOpen,
  onClose,
  onApply,
  initialValues,
}: TimbanganFilterModalProps) {
  const [filters, setFilters] = React.useState<FilterValues>({
    ...EMPTY_FILTERS,
    ...initialValues,
  });

  // Sync initialValues saat modal dibuka
  React.useEffect(() => {
    if (isOpen) {
      setFilters({ ...EMPTY_FILTERS, ...initialValues });
    }
  }, [isOpen]);

  const hasActiveFilter =
    filters.startDate ||
    filters.endDate ||
    filters.customer ||
    filters.ownership_type ||
    filters.status;

  const handleReset = () => setFilters(EMPTY_FILTERS);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filter" centerTitle>
      <div className="flex flex-col gap-5">

        {/* ── Date Range ── */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Rentang Tanggal
          </p>
          <div className="flex items-center gap-3">
            {/* Start Date */}
            <div className="relative flex-1">
              <CalendarBlank
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#009262]/30 focus:border-[#009262] transition"
              />
            </div>

            <span className="text-gray-400 text-sm font-medium shrink-0">s/d</span>

            {/* End Date */}
            <div className="relative flex-1">
              <CalendarBlank
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                min={filters.startDate || undefined}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#009262]/30 focus:border-[#009262] transition"
              />
            </div>
          </div>
        </div>

        {/* ── Customer ── */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Customer
          </p>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama customer..."
              value={filters.customer}
              onChange={(e) =>
                setFilters({ ...filters, customer: e.target.value })
              }
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#009262]/30 focus:border-[#009262] transition"
            />
            {filters.customer && (
              <button
                onClick={() => setFilters({ ...filters, customer: "" })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── Ownership & Status (2 kolom) ── */}
        <div className="grid grid-cols-2 gap-3">

          {/* Ownership */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Ownership
            </p>
            <div className="relative">
              <select
                value={filters.ownership_type}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    ownership_type: e.target.value as FilterValues["ownership_type"],
                  })
                }
                className="w-full appearance-none px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#009262]/30 focus:border-[#009262] transition pr-8"
              >
                <option value="">Semua</option>
                <option value="farmer">Petani</option>
                <option value="private">Private</option>
              </select>
              <CaretDown
                size={14}
                weight="bold"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Status
            </p>
            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: e.target.value as FilterValues["status"],
                  })
                }
                className="w-full appearance-none px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#009262]/30 focus:border-[#009262] transition pr-8"
              >
                <option value="">Semua</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
              <CaretDown
                size={14}
                weight="bold"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* ── Active filter chips ── */}
        {hasActiveFilter && (
          <div className="flex flex-wrap gap-2">
            {filters.startDate && (
              <Chip
                label={`Dari: ${filters.startDate}`}
                onRemove={() => setFilters({ ...filters, startDate: "" })}
              />
            )}
            {filters.endDate && (
              <Chip
                label={`Sampai: ${filters.endDate}`}
                onRemove={() => setFilters({ ...filters, endDate: "" })}
              />
            )}
            {filters.customer && (
              <Chip
                label={filters.customer}
                onRemove={() => setFilters({ ...filters, customer: "" })}
              />
            )}
            {filters.ownership_type && (
              <Chip
                label={filters.ownership_type === "farmer" ? "Petani" : "Private"}
                onRemove={() => setFilters({ ...filters, ownership_type: "" })}
              />
            )}
            {filters.status && (
              <Chip
                label={filters.status === "paid" ? "Paid" : "Unpaid"}
                onRemove={() => setFilters({ ...filters, status: "" })}
              />
            )}
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleReset}
            disabled={!hasActiveFilter}
            className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-[2] py-2.5 text-sm font-semibold rounded-lg bg-[#009262] hover:bg-[#007a52] text-white flex items-center justify-center gap-2 transition"
          >
            <Funnel size={16} weight="bold" />
            Terapkan Filter
          </button>
        </div>

      </div>
    </Modal>
  );
}

/* ── Chip helper ── */
function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#009262]/10 text-[#009262] border border-[#009262]/20">
      {label}
      <button onClick={onRemove} className="hover:text-[#007a52]">
        <X size={11} weight="bold" />
      </button>
    </span>
  );
}