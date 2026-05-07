import React, { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface CustomerFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: { type: string }) => void;
  initialType?: string;
}

export default function CustomerFilterModal({
  isOpen,
  onClose,
  onApply,
  initialType,
}: CustomerFilterModalProps) {
  const [filters, setFilters] = useState({
    type: initialType
      ? initialType.charAt(0).toUpperCase() + initialType.slice(1).toLowerCase()
      : "",
  });

  React.useEffect(() => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      type: initialType
        ? initialType.charAt(0).toUpperCase() +
          initialType.slice(1).toLowerCase()
        : "",
    }));
  }, [initialType, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Filter"
      size="sm"
      footer={
        <Button
          variant="primary"
          className="w-full py-4"
          onClick={() => onApply(filters)}
        >
          Terapkan
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <Select
          label="Tipe Kepemilikan"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          icon={<CaretDown size={18} weight="bold" />}
          options={[
            { value: "", label: "All" },
            { value: "Private", label: "Pribadi" },
            { value: "Farmer", label: "Petani" },
          ]}
        />
      </div>
    </Modal>
  );
}
