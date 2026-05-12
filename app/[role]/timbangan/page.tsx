"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AntrianTable } from "@/components/dashboard/AntrianTable";
import { RiwayatTimbanganTable } from "@/components/dashboard/RiwayatTimbanganTable";
import { StatCard } from "@/components/ui/StatCard";
import { DeleteModal, Toast } from "@/components/ui";
import TimbanganFilterModal from "@/components/dashboard/TimbanganFilterModal";

const DEFAULT_BRANCH_LOCATION_ID = "07bf151f-ed44-4a5d-96cb-afed7e087c7a";

interface ApiAntrianItem {
  id: string;
  tanggal_transaksi: string;
  loading_in: string;
  no_pol_truck: string;
  nama_driver: string;
  type_ownership: string | null;
  nama_petani: string;
  bruto: number;
}

interface ApiRiwayatItem {
  id: string;
  tanggal_transaksi: string;
  loading_in: string;
  loading_out: string;
  no_pol_truck: string;
  nama_driver: string;
  type_ownership: string | null;
  nama_petani: string;
  bruto: number;
  tara: number;
  netto: number;
  amount: number;
  payment_method: string;
  status: "paid" | "unpaid";
}

interface TimbanganHistoryResponse {
  statusCode: number;
  kpi: {
    paid: number;
    unpaid: number;
    inqueue: number;
  };
  data: {
    inQueue: ApiAntrianItem[];
    history: ApiRiwayatItem[];
  };
  page?: {
    number_page: number;
    total_page: number;
    total_data: number;
    per_page: number;
  };
}

export default function TimbanganPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleRaw = params.role as string;
  const role = !roleRaw || roleRaw === "undefined" ? "branch" : roleRaw;

  const [isLoading, setIsLoading] = useState(true);
  const [antrian, setAntrian] = useState<any[]>([]);
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [summary, setSummary] = useState({
    inQueue: 0,
    paid: 0,
    unpaid: 0,
  });
  const riwayatLimit = 10;
  const [riwayatPagination, setRiwayatPagination] = useState({
    per_page: riwayatLimit,
    number_page: 1,
    total_page: 1,
    total_data: 0,
  });
  const currentPage = Number(searchParams.get("page") || 1);

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  }

  const handlePageChange = (page: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      nextParams.set("page", String(page));
    } else {
      nextParams.delete("page");
    }
    router.push(`/${role}/timbangan?${nextParams.toString()}`);
  };

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const locationResponse = await axios.get(
          `/api/location/${searchParams.get("location_id") || DEFAULT_BRANCH_LOCATION_ID}`,
        );
        const locationData = locationResponse.data?.data;
        if (locationData) {
          setLocation(locationData);
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        // ✅ 1 request untuk antrian + KPI (tanpa filter, tanpa pagination)
        const antrianResponse = await axios.get<TimbanganHistoryResponse>(
          "/api/history/transaction",
          {
            params: {
              limit: 10,
              location_id:
                searchParams.get("location_id") || DEFAULT_BRANCH_LOCATION_ID,
              // tidak kirim filter apapun supaya KPI selalu akurat
            },
          },
        );

        setSummary({
          inQueue: Number(antrianResponse.data?.kpi?.inqueue ?? 0),
          paid: Number(antrianResponse.data?.kpi?.paid ?? 0),
          unpaid: Number(antrianResponse.data?.kpi?.unpaid ?? 0),
        });
        setAntrian(
          (antrianResponse.data?.data?.inQueue ?? []).map((item) => ({
            id: item.id,
            transaction_date: item.tanggal_transaksi,
            loading_in: item.loading_in,
            license_plate: item.no_pol_truck,
            driver_name: item.nama_driver,
            ownership_type: item.type_ownership ?? "",
            customer_name: item.nama_petani,
            bruto_weight: item.bruto,
          })),
        );

        const riwayatResponse = await axios.get<TimbanganHistoryResponse>(
          "/api/history/transaction",
          {
            params: {
              page: currentPage,
              limit: riwayatLimit,
              location_id:
                searchParams.get("location_id") || DEFAULT_BRANCH_LOCATION_ID,
              ...(searchParams.get("start_date")
                ? { start_date: searchParams.get("start_date") }
                : {}),
              ...(searchParams.get("end_date")
                ? { end_date: searchParams.get("end_date") }
                : {}),
              ...(searchParams.get("ownership_type")
                ? { ownership_type: searchParams.get("ownership_type") }
                : {}),
              ...(searchParams.get("status")
                ? { status: searchParams.get("status") }
                : {}),
              ...(searchParams.get("customer")
                ? { customer: searchParams.get("customer") }
                : {}),
            },
          },
        );

        setRiwayat(
          (riwayatResponse.data?.data?.history ?? []).map((item) => ({
            id: item.id,
            transaction_date: item.tanggal_transaksi,
            loading_in: item.loading_in,
            loading_out: item.loading_out,
            license_plate: item.no_pol_truck,
            driver_name: item.nama_driver,
            ownership_type: item.type_ownership ?? "",
            customer_name: item.nama_petani,
            bruto_weight: item.bruto,
            tarra_weight: item.tara,
            netto_weight: item.netto,
            total_price: item.amount,
            payment_method: item.payment_method,
            status: item.status,
          })),
        );

        // ✅ Pagination HANYA dari riwayatResponse
        if (riwayatResponse.data?.page) {
          setRiwayatPagination({
            per_page: riwayatLimit,
            number_page: riwayatResponse.data.page.number_page || currentPage,
            total_page: riwayatResponse.data.page.total_page || 1,
            total_data: riwayatResponse.data.page.total_data || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching timbangan data:", error);
        setAntrian([]);
        setRiwayat([]);
        setSummary({ inQueue: 0, paid: 0, unpaid: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams, currentPage]);

  return (
    <div className="flex flex-col w-full max-w-full pb-10">
      <Toast
        isVisible={showToast}
        message="Data Berhasil Disimpan"
        type="success"
      />
      <PageHeader
        title="Timbangan"
        primaryAction={{
          label: "Add",
          onClick: () => router.push(`/${role}/timbangan/add`),
        }}
        secondaryAction={{
          label: "Filter",
          onClick: () => setIsFilterOpen(true),
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Today"
          value={`${summary.inQueue} Truk`}
          title="Dalam Antrian"
        />
        <StatCard
          label="Today"
          value={formatCurrency(summary.paid)}
          title="Dibayar"
        />
        <StatCard
          label="Today"
          value={formatCurrency(summary.unpaid)}
          title="Belum Dibayar"
        />
        <StatCard
          label="Harga Patokan"
          value={location ? formatCurrency(location.sugar_price) : "Rp 0"}
          title="Harga tebu"
        />
      </div>

      <div className="flex flex-col gap-8">
        <AntrianTable data={antrian} isLoading={isLoading} role={role} />

        <RiwayatTimbanganTable
          data={riwayat}
          isLoading={isLoading}
          onEdit={(id) => router.push(`/${role}/timbangan/edit/${id}`)}
          onDelete={(id) => {
            setSelectedId(id);
            setIsDeleteOpen(true);
          }}
          onStatusChange={(id, status) =>
            console.log("Status change", id, status)
          }
          pagination={riwayatPagination}
          onPageChange={handlePageChange}
        />
      </div>

      <TimbanganFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        initialValues={{
          startDate: searchParams.get("start_date") ?? "",
          endDate: searchParams.get("end_date") ?? "",
          customer: searchParams.get("customer") ?? "",
          ownership_type: (searchParams.get("ownership_type") as any) ?? "",
          status: (searchParams.get("status") as any) ?? "",
        }}
        onApply={(f) => {
          const nextParams = new URLSearchParams();

          // Pertahankan location_id jika ada
          const locationId = searchParams.get("location_id");
          if (locationId) nextParams.set("location_id", locationId);

          // Reset ke page 1
          nextParams.delete("page");

          if (f.startDate) nextParams.set("start_date", f.startDate);
          if (f.endDate) nextParams.set("end_date", f.endDate);
          if (f.customer) nextParams.set("customer", f.customer);
          if (f.ownership_type)
            nextParams.set("ownership_type", f.ownership_type);
          if (f.status) nextParams.set("status", f.status);

          router.push(`/${role}/timbangan?${nextParams.toString()}`);
          setIsFilterOpen(false);
        }}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => console.log("Delete", selectedId)}
      />
    </div>
  );
}
