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
    start: "",
    end: ""
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
            label="Tanggal mulai" 
            type="date"
            value={dates.start}
            onChange={(e) => setDates({ ...dates, start: e.target.value })}
          />
          <Input 
            label="Tanggal berakhir" 
            type="date"
            value={dates.end}
            onChange={(e) => setDates({ ...dates, end: e.target.value })}
          />
        </div>

        <div className="flex gap-3">
          <Button 
            variant="white"
            className="flex-1 py-4"
            onClick={() => {
              const cleared = { start: "", end: "" };
              setDates(cleared);
              onApply(cleared);
              onClose();
            }}
          >
            Clear
          </Button>
          <Button 
            variant="primary" 
            className="flex-1 py-4 bg-[#009262] hover:bg-[#007a52]"
            onClick={() => {
              onApply(dates);
              onClose();
            }}
          >
            Terapkan
          </Button>
        </div>
      </div>
    </Modal>
  );
}
