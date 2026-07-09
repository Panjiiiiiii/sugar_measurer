import fs from "fs";
import {
  PAPER_HEIGHT_MM,
  PAPER_WIDTH_MM,
  sanitizeForPrinter,
} from "@/lib/receipt";

const ESC = 0x1b;
const GS = 0x1d;
const UNIT_MM = 0.125;

function buildPaperSizeCommands(): Buffer {
  const pageLengthUnits = Math.round(PAPER_HEIGHT_MM / UNIT_MM);
  const printWidthUnits = Math.round(PAPER_WIDTH_MM / UNIT_MM);

  const setPageLength = Buffer.from([
    ESC,
    0x28,
    0x43,
    0x02,
    pageLengthUnits & 0xff,
    (pageLengthUnits >> 8) & 0xff,
  ]);

  const setPrintWidth = Buffer.from([
    GS,
    0x28,
    0x57,
    0x02,
    printWidthUnits & 0xff,
    (printWidthUnits >> 8) & 0xff,
  ]);

  return Buffer.concat([setPageLength, setPrintWidth]);
}

export function buildEscPosPayload(text: string): Buffer {
  const sanitized = sanitizeForPrinter(text);
  const init = Buffer.from([ESC, 0x40]);
  const paperSize = buildPaperSizeCommands();
  const charset = Buffer.from([ESC, 0x74, 0x00]);
  const content = Buffer.from(sanitized.replace(/\n/g, "\r\n"), "latin1");
  const formFeed = Buffer.from([0x0c]);
  const cut = Buffer.from([GS, 0x56, 0x01]);

  return Buffer.concat([init, paperSize, charset, content, formFeed, cut]);
}

function resolvePrinterPath(): string {
  const configured = process.env.PRINTER_PORT?.trim();
  if (!configured) return "\\\\.\\LPT1";
  if (configured.startsWith("\\\\.\\")) return configured;
  return `\\\\.\\${configured}`;
}

export async function sendToDotMatrixPrinter(payload: Buffer): Promise<void> {
  const printerPath = resolvePrinterPath();

  await fs.promises.writeFile(printerPath, payload);
}
