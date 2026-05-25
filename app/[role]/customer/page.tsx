"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { CustomerTable } from "@/components/dashboard/CustomerTable";
import { DeleteModal, Toast, Select } from "@/components/ui";

// These types would ideally come from a central types file or generated prisma types
interface Customer {
  id: string;
  name: string;
  ownership_type: "farmer" | "private";
  account_number: string;
}

export default function CustomerPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleRaw = params.role as string;
  const role = (!roleRaw || roleRaw === "undefined") ? "branch" : roleRaw;

  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Simulating data fetch from backend
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData: Customer[] = [
        { id: "1", name: "Budi", ownership_type: "farmer", account_number: "087459687412" },
        { id: "2", name: "Dadang", ownership_type: "private", account_number: "087459687412" },
        { id: "3", name: "Julpan", ownership_type: "farmer", account_number: "087459687412" },
        { id: "4", name: "Jaedin", ownership_type: "private", account_number: "087459687412" },
      ];
      
      setCustomers(mockData);
      setIsLoading(false);
    };

    fetchCustomers();
  }, []);

  return (
    <div className="flex flex-col w-full max-w-full pb-10">
      <Toast 
        isVisible={showToast} 
        message="Data Berhasil Disimpan" 
        type="success" 
      />
      <PageHeader 
        title="Data Customer"
        extraActions={
          <div className="w-32">
            <Select 
              variant="compact"
              defaultValue="Month" 
              options={[
                { value: "All", label: "All" },
                { value: "Year", label: "Year" },
                { value: "Month", label: "Month" },
                { value: "Week", label: "Week" },
                { value: "Day", label: "Day" }
              ]} 
            />
          </div>
        }
        primaryAction={{
          label: "Add",
          onClick: () => router.push(`/${role}/customer/add`)
        }}
        secondaryAction={{
          label: "Filter",
          onClick: () => console.log("Open Filter Modal")
        }}
      />

      <CustomerTable 
        data={customers}
        isLoading={isLoading}
        onEdit={(id) => router.push(`/${role}/customer/edit/${id}`)}
        onDelete={(id) => {
          setSelectedCustomerId(id);
          setIsDeleteModalOpen(true);
        }}
      />

      <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (selectedCustomerId) {
            setCustomers(prev => prev.filter(c => c.id !== selectedCustomerId));
          }
          setIsDeleteModalOpen(false);
        }}
        message="Apakah anda yakin ingin menghapus data user ini?"
      />
    </div>
  );
}
