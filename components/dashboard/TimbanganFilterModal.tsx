"use client";

import React from "react";
import { Modal, Input, Select, Button } from "@/components/ui";
import { CaretDown, CalendarBlank } from "@phosphor-icons/react";

interface TimbanganFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

export default function TimbanganFilterModal({ isOpen, onClose, onApply }: TimbanganFilterModalProps) {
  const [filters, setFilters] = React.useState({
    startDate: "11/03/2026",
    endDate: "11/04/2026",
    customer: "Abah",
    ownership: "Private",
    status: "Paid"
  });

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Filter"
      centerTitle
    >
      <div className="flex flex-col gap-6">
        {/* Date Range */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input 
              label="Awal tanggal" 
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              icon={<CalendarBlank size={18} className="text-gray-400" />}
            />
          </div>
          <div className="mt-6 text-gray-400">
            <span className="text-xl">→</span>
          </div>
          <div className="flex-1">
            <Input 
              label="Akhir tanggal" 
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              icon={<CalendarBlank size={18} className="text-gray-400" />}
            />
          </div>
        </div>

        {/* Customer */}
        <Input 
          label="Customer" 
          value={filters.customer}
          onChange={(e) => setFilters({ ...filters, customer: e.target.value })}
        />

        {/* Ownership */}
        <Select 
          label="Ownership" 
          value={filters.ownership}
          onChange={(e) => setFilters({ ...filters, ownership: e.target.value })}
          icon={<CaretDown size={18} weight="bold" />}
          options={[
            { value: "Private", label: "Private" },
            { value: "Petani", label: "Petani" }
          ]}
        />

        {/* Status */}
        <Select 
          label="Status" 
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          icon={<CaretDown size={18} weight="bold" />}
          options={[
            { value: "Paid", label: "Paid" },
            { value: "Unpaid", label: "Unpaid" }
          ]}
        />

        {/* Apply Button */}
        <Button 
          variant="primary" 
          className="w-full py-4 bg-[#009262] hover:bg-[#007a52] mt-2"
          onClick={() => {
            onApply(filters);
            onClose();
          }}
        >
          Terapkan
        </Button>
      </div>
    </Modal>
  );
}
