"use client";

import React from "react";
import { Modal, Input, Button } from "@/components/ui";
import { CalendarBlank } from "@phosphor-icons/react";

interface DateFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (dates: { start: string; end: string }) => void;
}

export function DateFilterModal({ isOpen, onClose, onApply }: DateFilterModalProps) {
  const [dates, setDates] = React.useState({
    start: "11/03/2026",
    end: "11/04/2026"
  });

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Filter Tanggal"
      centerTitle
      size="sm"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Input 
            label="Awal tanggal" 
            type="date"
            value={dates.start}
            onChange={(e) => setDates({ ...dates, start: e.target.value })}
          />
          <Input 
            label="Akhir tanggal" 
            type="date"
            value={dates.end}
            onChange={(e) => setDates({ ...dates, end: e.target.value })}
          />
        </div>

        <Button 
          variant="primary" 
          className="w-full py-4 bg-[#009262] hover:bg-[#007a52]"
          onClick={() => {
            onApply(dates);
            onClose();
          }}
        >
          Terapkan
        </Button>
      </div>
    </Modal>
  );
}
