import { z } from "zod";

export const CreateBranchTransactionSchema = z.object({
    bruto: z.coerce
        .number({ message: "bruto is required" })
        .int("bruto must be an integer")
        .min(0, "bruto must be a positive number"),
    loading_in: z
        .string({ message: "loading_in is required" })
        .min(1, "loading_in is required")
        .trim(),
    tare: z.preprocess(
        (value) => {
            if (value === "" || value === null) {
                return undefined;
            }

            return value;
        },
        z.coerce
            .number({ message: "tare is required" })
            .int("tare must be an integer")
            .min(0, "tare must be a positive number")
            .optional(),
    ),
    loading_out: z.preprocess(
        (value) => {
            if (typeof value === "string" && value.trim() === "") {
                return undefined;
            }

            return value;
        },
        z.string().trim().optional(),
    ),
    truck_id: z
        .string({ message: "truck_id is required" })
        .min(1, "truck_id is required")
        .trim(),
    location_id: z
        .string({ message: "location_id is required" })
        .min(1, "location_id is required")
        .trim(),
});

export type CreateBranchTransactionInput = z.infer<typeof CreateBranchTransactionSchema>;

export function validateCreateBranchTransactionInput(data: unknown) {
    return CreateBranchTransactionSchema.parse(data);
}

export function validateCreateBranchTransactionInputSafe(data: unknown) {
    return CreateBranchTransactionSchema.safeParse(data);
}