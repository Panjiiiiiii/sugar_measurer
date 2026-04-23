import { z } from "zod";

const TruckSchema = z.object({
    nama_truck: z
        .string()
        .max(255, "Truck name must not exceed 255 characters")
        .optional(),
    type_truck: z
        .enum(["engkel", "double"])
        .optional(),
    no_pol: z
        .string()
        .min(1, "License plate is required")
        .max(255, "License plate must not exceed 255 characters"),
});

export const CreateOwnerSchema = z.object({
    owner: z.object({
        nama_owner: z
            .string()
            .min(1, "Owner name is required")
            .max(255, "Owner name must not exceed 255 characters")
            .trim(),
        account_number: z
            .string()
            .min(1, "Account number is required")
            .max(255, "Account number must not exceed 255 characters")
            .trim(),
        type_ownership: z.enum(["farmer", "private"], {
            message: "Ownership type must be either farmer or private",
        }),
    }),
    data_truck: z
        .array(TruckSchema)
        .min(1, "At least one truck is required")
        .refine(
            (trucks) => {
                const nopols = trucks.map((t) => t.no_pol.toUpperCase());
                return new Set(nopols).size === nopols.length;
            },
            {
                message: "License plate must be unique within the request",
                path: ["data_truck"],
            },
        ),
});

export type CreateOwnerInput = z.infer<typeof CreateOwnerSchema>;
export type TruckInput = z.infer<typeof TruckSchema>;

export function validateCreateOwnerInput(data: unknown) {
    return CreateOwnerSchema.parse(data);
}

export function validateCreateOwnerInputSafe(data: unknown) {
    return CreateOwnerSchema.safeParse(data);
}
