import { NextResponse } from "next/server";

// Server-side only — TANPA prefix NEXT_PUBLIC_ karena fetch ini jalan di
// server Next.js (Node), bukan di browser, jadi tidak kena CORS sama sekali.
const SCALE_URL = process.env.SCALE_LOAD_URL;

export async function GET() {
  if (!SCALE_URL) {
    return NextResponse.json(
      { error: "URL timbangan belum dikonfigurasi (SCALE_LOAD_URL)" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(SCALE_URL, {
      cache: "no-store",
      headers: {
        // beberapa servis lokal/IoT cek header ini sebelum mengizinkan request
        Origin: "http://localhost:3000",
        Referer: "http://localhost:3000/",
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Scale service responded with ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching from scale service:", error);
    return NextResponse.json(
      { error: "Failed to fetch scale data" },
      { status: 502 }
    );
  }
}