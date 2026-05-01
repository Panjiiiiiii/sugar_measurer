import { z } from "zod";

export const CreateTransferSchema = z.object({
    amount: z.coerce
        .number({ message: "Amount is required" })
        .positive("Amount must be greater than 0"),
    bukti_transfer: z
        .string({ message: "bukti_transfer is required" })
        .min(1, "bukti_transfer is required")
        .optional(),
    location_id : z.string({ message: "location_id is required" }).min(1, "location_id is required"),
    user_id : z.string({ message: "user_id is required" }).min(1, "user_id is required"),
});

export type CreateTransferInput = z.infer<typeof CreateTransferSchema>;

export function validateCreateTransferInput(data: unknown) {
    return CreateTransferSchema.parse(data);
}

export function validateCreateTransferInputSafe(data: unknown) {
    return CreateTransferSchema.safeParse(data);
}
