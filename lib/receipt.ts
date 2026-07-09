export const RECEIPT_WIDTH = 40;
export const PAPER_WIDTH_MM = 241;
export const PAPER_HEIGHT_MM = 280;
export const SIGNATURE_BLANK_LINES = 5;

export interface ReceiptFormatData {
  customer: string;
  noUrut: string;
  material: string;
  kode: string;
  noRec: string;
  noPol: string;
  tglMasuk: string;
  jamMasuk: string;
  tglKeluar: string;
  jamKeluar: string;
  bruto: string;
  tara: string;
  netto: string;
  harga: string;
  rafaksi: string;
  nilai: string;
  operator: string;
}

export interface ReceiptData {
  customer: string;
  nopol: string;
  masuk: string;
  keluar: string;
  bruto: string;
  tara: string;
  netto: string;
  hargaPerKw: string;
  total: string;
  operator: string;
  noUrut?: string;
  kode?: string;
  noRec?: string;
  rafaksi?: string;
  tglMasuk?: string;
  tglKeluar?: string;
  material?: string;
}

const SEPARATOR = "-".repeat(RECEIPT_WIDTH);

function center(text: string, width = RECEIPT_WIDTH): string {
  const trimmed = text.slice(0, width);
  const padding = Math.max(0, width - trimmed.length);
  const left = Math.floor(padding / 2);
  return " ".repeat(left) + trimmed + " ".repeat(padding - left);
}

function leftRight(left: string, right: string, width = RECEIPT_WIDTH): string {
  const rightPart = right.slice(0, width);
  const leftMax = Math.max(0, width - rightPart.length);
  const leftPart = left.slice(0, leftMax);
  return leftPart.padEnd(width - rightPart.length) + rightPart;
}

function formatDateId(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}

function normalizeTime(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "00:00";
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    return trimmed.slice(0, 5);
  }
  return trimmed.slice(0, 5);
}

function stripCurrency(value: string): string {
  return value.replace(/Rp\.?\s?/gi, "").trim() || "0";
}

export function toReceiptFormatData(data: ReceiptData): ReceiptFormatData {
  const today = formatDateId(new Date());

  return {
    customer: (data.customer || "-").toUpperCase(),
    noUrut: data.noUrut || "-",
    material: (data.material || "TEBU").toUpperCase(),
    kode: data.kode || "-",
    noRec: data.noRec || "-",
    noPol: (data.nopol || "-").toUpperCase(),
    tglMasuk: data.tglMasuk || today,
    jamMasuk: normalizeTime(data.masuk || "00:00"),
    tglKeluar: data.keluar ? data.tglKeluar || today : "-",
    jamKeluar: data.keluar ? normalizeTime(data.keluar) : "-",
    bruto: data.bruto || "0",
    tara: data.tara || "0",
    netto: data.netto || "0",
    harga: stripCurrency(data.hargaPerKw || "0"),
    rafaksi: data.rafaksi ?? "0",
    nilai: stripCurrency(data.total || "0"),
    operator: data.operator || "-",
  };
}

export function formatReceipt(data: ReceiptFormatData): string {
  const lines = [
    SEPARATOR,
    center("UD. FADJAR"),
    "Dsn. Bandarangin, Kec. Pagak",
    "Kab. Malang",
    "BUKTI PENIMBANGAN/NOTA PEMBAYARAN",
    SEPARATOR,
    leftRight(`CUSTOMER : ${data.customer}`, data.noUrut),
    leftRight(`MATERIAL : ${data.material}`, data.kode),
    `NO POL   : ${data.noPol}`.slice(0, RECEIPT_WIDTH),
    "",
    `Masuk  : ${data.tglMasuk} ${data.jamMasuk}`.slice(0, RECEIPT_WIDTH),
    `Keluar : ${data.tglKeluar} ${data.jamKeluar}`.slice(0, RECEIPT_WIDTH),
    SEPARATOR,
    `BRUTO  : ${data.bruto} kg`.slice(0, RECEIPT_WIDTH),
    `TARA   : ${data.tara} kg`.slice(0, RECEIPT_WIDTH),
    SEPARATOR,
    `NETTO  : ${data.netto} kw`.slice(0, RECEIPT_WIDTH),
    `HARGA  : Rp. ${data.harga}/kg`.slice(0, RECEIPT_WIDTH),
    `NILAI  : Rp. ${data.nilai}`.slice(0, RECEIPT_WIDTH),
    SEPARATOR,
    ...Array.from({ length: SIGNATURE_BLANK_LINES }, () => ""),
    center("Operator"),
    center(`(${data.operator})`),
    SEPARATOR,
  ];

  return lines
    .map((line) => {
      if (!line) return "";
      return line.slice(0, RECEIPT_WIDTH).padEnd(RECEIPT_WIDTH, " ");
    })
    .join("\n");
}

export function sanitizeForPrinter(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
}
