import {
  formatReceipt,
  toReceiptFormatData,
  type ReceiptData,
} from "@/lib/receipt";
import { buildEscPosPayload, sendToDotMatrixPrinter } from "@/lib/dotMatrixPrinter";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text =
      typeof body.text === "string" && body.text.trim()
        ? body.text
        : formatReceipt(toReceiptFormatData(body.data as ReceiptData));

    const payload = buildEscPosPayload(text);

    if (process.env.PRINT_DRY_RUN === "true") {
      return Response.json(
        {
          statusCode: 200,
          message: "Dry run: receipt formatted successfully",
          data: { text, bytes: payload.length },
        },
        { status: 200 },
      );
    }

    await sendToDotMatrixPrinter(payload);

    return Response.json(
      {
        statusCode: 200,
        message: "Receipt sent to printer",
        data: { text },
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to print receipt";

    return Response.json(
      {
        statusCode: 500,
        message,
        data: null,
      },
      { status: 500 },
    );
  }
}
