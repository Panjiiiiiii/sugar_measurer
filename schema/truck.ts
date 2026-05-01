import { z } from "zod";

export const CreateTruckSchema = z
    .object({
        license_plate: z
            .string()
            .min(1, "License plate is required")
            .max(255, "License plate must not exceed 255 characters")
            .trim(),
        name: z
            .string()
            .max(255, "Truck name must not exceed 255 characters")
            .optional(),
        truck_type: z.enum(["engkel", "double"]).optional().nullable(),
    })

export type CreateTruckInput = z.infer<typeof CreateTruckSchema>;

export function validateCreateTruckInput(data: unknown) {
    return CreateTruckSchema.parse(data);
}

export function validateCreateTruckRegisterInputSafe(data: unknown) {
    return CreateTruckSchema.safeParse(data);
}
