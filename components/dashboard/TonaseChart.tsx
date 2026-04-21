"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CaretDown } from "@phosphor-icons/react";

const data = [
  { time: "07:00", value: 550 },
  { time: "08:00", value: 750 },
  { time: "09:00", value: 480 },
  { time: "10:00", value: 350 },
  { time: "11:00", value: 750 },
  { time: "12:00", value: 600 },
  { time: "13:00", value: 750 },
  { time: "14:00", value: 580 },
  { time: "15:00", value: 820 },
  { time: "16:00", value: 650 },
  { time: "17:00", value: 200 }, // Lower before peak
  { time: "18:00", value: 480, isPeak: true },
  { time: "19:00", value: 650 },
  { time: "20:00", value: 450 },
  { time: "21:00", value: 700 },
  { time: "22:00", value: 550 },
];

export default function TonaseChart() {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-8 transition-all">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">Tonase Harian</h3>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">
          Selasa
          <CaretDown size={12} weight="bold" className="text-gray-400" />
        </button>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 600 }}
              ticks={[0, 200, 400, 600, 800]}
            />
            <Tooltip 
              cursor={false}
              contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
            />
            <Bar 
              dataKey="value" 
              radius={[6, 6, 0, 0]} 
              barSize={28}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === activeIndex ? "#0099FF" : "#F3F4F6"}
                  className="transition-all duration-300 cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
