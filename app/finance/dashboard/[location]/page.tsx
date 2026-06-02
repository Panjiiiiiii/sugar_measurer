"use client";

import React from "react";
import { useParams } from "next/navigation";

export default function LocationDashboard() {
  const params = useParams();
  const location = params.location as string;

  const getCityName = (id: string) => {
    const map: Record<string, string> = {
      "loc-1": "Malang",
      "loc-2": "Blitar",
      "loc-3": "Kediri 1",
      "loc-4": "Kediri 2",
      "malang": "Malang",
      "blitar": "Blitar",
      "kediri-1": "Kediri 1",
      "kediri-2": "Kediri 2",
    };
    return map[id] || id.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };
  const locationName = getCityName(location);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 capitalize">
        Dashboard {locationName}
      </h1>
      <p className="text-gray-500 mt-2">
        Showing detailed data for {locationName}.
      </p>
      
      {/* For demonstration, we can show a simplified version of the main dashboard or a loading state */}
      <div className="mt-8 p-12 bg-white border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
           <span className="text-2xl">📍</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900">Detailed View Coming Soon</h2>
        <p className="text-sm text-gray-400 max-w-xs mx-auto">
          We are working on bringing more detailed analytics for each location.
        </p>
      </div>
    </div>
  );
}
