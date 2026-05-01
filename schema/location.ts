import { z } from "zod";

export const CreateLocationSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .max(255, "Name must not exceed 255 characters")
        .trim(),
    sugar_price: z
        .number()
        .int("Sugar price must be an integer")
        .min(0, "Sugar price must be a positive number"),
    account_balance: z
        .number()
        .int("Account balance must be an integer")
        .min(0, "Account balance must be a positive number")
        .optional()
        .default(0),
});

export type CreateLocationInput = z.infer<typeof CreateLocationSchema>;

export function validateCreateLocationInput(data: unknown) {
    return CreateLocationSchema.parse(data);
}

export function validateCreateLocationInputSafe(data: unknown) {
    return CreateLocationSchema.safeParse(data);
}
