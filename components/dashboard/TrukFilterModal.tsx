import React, { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface TrukFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: { type: string; ownership: string }) => void;
}

export default function TrukFilterModal({ isOpen, onClose, onApply }: TrukFilterModalProps) {
  const [filters, setFilters] = useState({
    type: "Engkel",
    ownership: "Private",
  });

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Filter"
      size="sm"
      footer={
        <Button variant="primary" className="w-full py-4" onClick={() => onApply(filters)}>
          Terapkan
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <Select 
          label="Type"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          icon={<CaretDown size={18} weight="bold" />}
          options={[
            { value: "Engkel", label: "Engkel" },
            { value: "Double", label: "Double" }
          ]}
        />

        <Select 
          label="Ownership"
          value={filters.ownership}
          onChange={(e) => setFilters({ ...filters, ownership: e.target.value })}
          icon={<CaretDown size={18} weight="bold" />}
          options={[
            { value: "Private", label: "Private" },
            { value: "Company", label: "Company" }
          ]}
        />
      </div>
    </Modal>
  );
}
