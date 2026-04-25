"use client";

import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { CaretDown } from "@phosphor-icons/react";

const data = [
  { time: "07:00", value: 500 },
  { time: "08:00", value: 750 },
  { time: "09:00", value: 450 },
  { time: "10:00", value: 350 },
  { time: "11:00", value: 750 },
  { time: "12:00", value: 600 },
  { time: "13:00", value: 750 },
  { time: "14:00", value: 580 },
  { time: "15:00", value: 850 },
  { time: "16:00", value: 650 },
  { time: "17:00", value: 250 },
  { time: "18:00", value: 500 },
  { time: "19:00", value: 650 },
  { time: "20:00", value: 450 },
  { time: "21:00", value: 700 },
  { time: "22:00", value: 550 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-2xl shadow-xl border border-gray-50 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-200">
        <p className="text-[13px] font-bold text-gray-900 leading-none">{label}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <p className="text-[13px] font-bold text-gray-900">
            <span className="text-gray-400 font-medium">value : </span>
            {payload[0].value}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function FinanceChart() {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [selectedLocation, setSelectedLocation] = React.useState("Malang");

  const locations = ["Malang", "Blitar", "Kediri 1", "Kediri 2"];

  const renderCustomBar = (props: any) => {
    const { x, y, width, height } = props;

    return (
      <g className="bar-group cursor-pointer outline-none">
        {/* Background Bar */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="#F3F4F6"
          rx={6}
        />
        {/* Animated Foreground Bar */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="#0099FF"
          rx={6}
          className="bar-foreground"
        />
      </g>
    );
  };

  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-8 transition-all">
      <style>{`
        .bar-foreground {
          clip-path: inset(100% 0 0 0);
          transition: clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
        }
        .bar-group:hover .bar-foreground {
          clip-path: inset(0% 0 0 0);
          fill: #0099FF !important;
          transition: clip-path 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">Tonase Harian</h3>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            {selectedLocation}
            <CaretDown
              size={18}
              weight="bold"
              className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {locations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setSelectedLocation(loc);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${selectedLocation === loc
                        ? "text-[#009253] bg-green-50/50"
                        : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
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
              content={<CustomTooltip />}
            />
            <Bar
              dataKey="value"
              barSize={28}
              shape={renderCustomBar}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
