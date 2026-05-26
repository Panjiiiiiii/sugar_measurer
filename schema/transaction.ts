import { z } from "zod";

export const CreateBranchTransactionSchema = z.object({
  bruto_weight: z
    .number({ message: "bruto is required" })
    .int("bruto must be an integer")
    .min(0, "bruto must be a positive number"),
  loading_in: z
    .string({ message: "loading_in is required" })
    .min(1, "loading_in is required")
    .trim(),
  truck_id: z
    .string({ message: "truck_id is required" })
    .min(1, "truck_id is required")
    .trim(),
  location_id: z
    .string({ message: "location_id is required" })
    .min(1, "location_id is required")
    .trim(),
  user_id: z
    .string({ message: "user_id is required" })
    .min(1, "user_id is required")
    .trim(),
  owner_id: z
    .string({ message: "owner_id is required" })
    .min(1, "owner_id is required")
    .trim(),
  sugar_price: z.number().int().min(0).optional(),
  driver_name: z.string().optional(),
  tarra_weight: z.number().int().min(0).optional(),
  payment_method : z.enum(['cash', 'transfer']).optional(),
  loading_out: z.string().optional(),
});

export type CreateBranchTransactionInput = z.infer<
  typeof CreateBranchTransactionSchema
>;

export function validateCreateBranchTransactionInput(data: unknown) {
  return CreateBranchTransactionSchema.parse(data);
}

export function validateCreateBranchTransactionInputSafe(data: unknown) {
  return CreateBranchTransactionSchema.safeParse(data);
}
