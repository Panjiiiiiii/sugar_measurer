"use client";

import { DotsThreeVertical, Export } from "@phosphor-icons/react";
import { Card, ActionMenu, Pagination } from "@/components/ui";

interface CustomerData {
  id: string;
  name: string;
  ownership_type: "farmer" | "private";
  phone_number: string;
  special_price: number | null;
}

interface CustomerTableProps {
  data: CustomerData[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  pagination?: {
    per_page: number;
    number_page: number;
    total_page: number;
    total_data: number;
  };
  onPageChange?: (page: number) => void;
}

export function CustomerTable({
  data,
  onEdit,
  onDelete,
  isLoading,
  pagination,
  onPageChange,
}: CustomerTableProps) {
  const currentPage = pagination?.number_page ?? 1;
  const totalPages = pagination?.total_page ?? 1;
  const totalData = pagination?.total_data ?? data.length;
  const showingData = pagination?.per_page ?? data.length;
  const handleExport = () => {
    if (typeof window === "undefined") return;
    import("xlsx").then((XLSX) => {
      const worksheet = XLSX.utils.json_to_sheet(
        data.map((customer) => ({
          Nama: customer.name,
          "Type Owner": customer.ownership_type === "farmer" ? "Petani" : "Private",
          "Phone Number": customer.phone_number,
          "Special Price": `Rp ${new Intl.NumberFormat("id-ID").format(customer.special_price ?? 0)} /kg`,
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
      XLSX.writeFile(workbook, "Data_Customer.xlsx");
    });
  };

  return (
    <Card 
      title="Data Customer" 
      noPadding
      headerAction={
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer transition-all"
        >
          <Export size={16} weight="bold" />
          <span>Export</span>
        </button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400">
              <th className="px-8 py-5 text-left font-semibold text-gray-400">Nama</th>
              <th className="px-4 py-5 text-left font-semibold text-gray-400">Type Owner</th>
              <th className="px-4 py-5 text-left font-semibold text-gray-400">Phone Number</th>
              <th className="px-4 py-5 text-left font-semibold text-gray-400">Special Price</th>
              <th className="px-8 py-5 text-right font-semibold text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              // Skeleton Loading
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-5">
                      <div className="h-4 bg-gray-100 rounded-lg w-24"></div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="h-4 bg-gray-100 rounded-lg w-20"></div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="h-4 bg-gray-100 rounded-lg w-32"></div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="h-4 bg-gray-100 rounded-lg w-24"></div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="h-9 bg-gray-50 rounded-xl w-9 ml-auto"></div>
                    </td>
                  </tr>
                ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={5} className="px-8 py-10 text-center">
                  <p className="text-gray-400 text-sm font-medium">
                    Tidak ada data customer
                  </p>
                </td>
              </tr>
            ) : (
              data.map((customer) => (
                <tr
                  key={customer.id}
                  className="group hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-8 py-4 text-xs font-semibold text-[#111827] text-left">
                    {customer.name}
                  </td>
                  <td className="px-4 py-4 text-xs font-medium text-gray-500 text-left capitalize">
                    {(() => {
                      if (customer.ownership_type === "private") return "Private";
                      if (customer.ownership_type === "farmer") return "Petani";
                      if (customer.ownership_type === "special") return "Special";
                      return customer.ownership_type;
                    })()}
                  </td>
                  <td className="px-4 py-4 text-xs font-medium text-gray-500 text-left">
                    {customer.phone_number}
                  </td>
                  <td className="px-4 py-4 text-xs font-medium text-gray-500 text-left">
                    Rp {new Intl.NumberFormat("id-ID").format(customer.special_price ?? 0)} /kg
                  </td>
                  <td className="px-8 py-4 text-right">
                    <ActionMenu
                      trigger={
                        <button className="p-2 text-gray-400 hover:text-gray-900 border border-gray-100 rounded-xl hover:bg-white hover:shadow-sm transition-all inline-flex items-center justify-center cursor-pointer">
                          <DotsThreeVertical size={18} weight="bold" />
                        </button>
                      }
                      items={[
                        {
                          label: "Edit",
                          onClick: () => onEdit(customer.id),
                        },
                        {
                          label: "Hapus",
                          variant: "danger",
                          onClick: () => onDelete(customer.id),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!isLoading && data.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalData={totalData}
          showingData={showingData}
          onPageChange={onPageChange}
        />
      )}
    </Card>
  );
}
