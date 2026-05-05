"use client";

import React from "react";
import { ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";
import { Card, Badge } from "@/components/ui";

interface AntrianData {
  id: string;
  transaction_date: string;
  loading_in: string;
  license_plate: string;
  driver_name: string;
  ownership_type: string;
  customer_name: string;
  bruto_weight: number;
}

interface AntrianTableProps {
  data: AntrianData[];
  isLoading?: boolean;
  role: string;
}

export function AntrianTable({ data, isLoading, role }: AntrianTableProps) {
  return (
    <Card title="Antrian Timbangan" noPadding>
      <div className="px-8 pb-4">
        <Badge variant="blue">Today</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50">
              <th className="px-8 py-4">Tanggal</th>
              <th className="px-4 py-4">Masuk</th>
              <th className="px-4 py-4">Nopol</th>
              <th className="px-4 py-4">Supir</th>
              <th className="px-4 py-4">Ownership</th>
              <th className="px-4 py-4">Customer</th>
              <th className="px-4 py-4 text-center">Bruto</th>
              <th className="px-8 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-8 py-5"><div className="h-4 bg-gray-100 rounded-lg w-20"></div></td>
                  <td className="px-4 py-5"><div className="h-4 bg-gray-100 rounded-lg w-12"></div></td>
                  <td className="px-4 py-5"><div className="h-4 bg-gray-100 rounded-lg w-24"></div></td>
                  <td className="px-4 py-5"><div className="h-4 bg-gray-100 rounded-lg w-20"></div></td>
                  <td className="px-4 py-5"><div className="h-4 bg-gray-100 rounded-lg w-16"></div></td>
                  <td className="px-4 py-5"><div className="h-4 bg-gray-100 rounded-lg w-24"></div></td>
                  <td className="px-4 py-5 text-center"><div className="h-4 bg-gray-100 rounded-lg w-12 mx-auto"></div></td>
                  <td className="px-8 py-5 text-right"><div className="h-9 bg-gray-50 rounded-xl w-9 ml-auto"></div></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-8 py-10 text-center text-gray-400 text-sm">Tidak ada antrian</td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5 text-xs font-medium text-gray-600">{item.transaction_date}</td>
                  <td className="px-4 py-5 text-xs font-medium text-gray-600">{item.loading_in}</td>
                  <td className="px-4 py-5 text-xs font-bold text-gray-900">{item.license_plate}</td>
                  <td className="px-4 py-5 text-xs font-medium text-gray-600">{item.driver_name}</td>
                  <td className="px-4 py-5 text-xs font-medium text-gray-600 capitalize">{item.ownership_type}</td>
                  <td className="px-4 py-5 text-xs font-medium text-gray-600">{item.customer_name}</td>
                  <td className="px-4 py-5 text-xs font-bold text-gray-900 text-center">{item.bruto_weight} kg</td>
                  <td className="px-8 py-5 text-right">
                    <Link href={`/${role}/timbangan/antrian/${item.id}`}>
                      <button className="p-2 text-gray-400 hover:text-gray-900 border border-gray-100 rounded-xl hover:bg-white hover:shadow-sm transition-all">
                        <ArrowRight size={18} weight="bold" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
