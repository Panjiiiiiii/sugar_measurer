import { z } from "zod";

export const CreateOwnerSchema = z.object({
  nama_owner: z
    .string()
    .min(1, "Owner name is required")
    .max(255, "Owner name must not exceed 255 characters")
    .trim(),
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .max(255, "Phone number must not exceed 255 characters")
    .trim()
    .optional(),
  type_ownership: z.enum(["farmer", "private", "special"], {
    message: "Ownership type must be either farmer, private, or special",
  }),
  special_price: z
    .number()
    .min(0, "Special price must be a non-negative number")
    .optional(),
});

export type CreateOwnerInput = z.infer<typeof CreateOwnerSchema>;

export function validateCreateOwnerInput(data: unknown) {
  return CreateOwnerSchema.parse(data);
}

export function validateCreateOwnerInputSafe(data: unknown) {
  return CreateOwnerSchema.safeParse(data);
}
