import { z } from "zod";

const NewOwnerSchema = z.object({
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
});

export const CreateTruckRegisterSchema = z
    .object({
        no_pol: z
            .string()
            .min(1, "License plate is required")
            .max(255, "License plate must not exceed 255 characters")
            .trim(),
        nama_truck: z
            .string()
            .max(255, "Truck name must not exceed 255 characters")
            .optional(),
        type_truck: z.enum(["engkel", "double"]).optional().nullable(),
        owner_id: z.string().min(1, "Owner id is required when using an existing owner").optional(),
        isNewOwner: z.boolean().optional(),
        isNewOnwner: z.boolean().optional(),
        new_owner: NewOwnerSchema.optional(),
    })
    .superRefine((data, ctx) => {
        const useNewOwner = data.isNewOwner === true || data.isNewOnwner === true;

        if (useNewOwner && !data.new_owner) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["new_owner"],
                message: "new_owner is required when isNewOwner is true",
            });
        }

        if (!useNewOwner && !data.owner_id) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["owner_id"],
                message: "owner_id is required when isNewOwner is false",
            });
        }
    });

export type CreateTruckRegisterInput = z.infer<typeof CreateTruckRegisterSchema>;

export function validateCreateTruckRegisterInput(data: unknown) {
    return CreateTruckRegisterSchema.parse(data);
}

export function validateCreateTruckRegisterInputSafe(data: unknown) {
    return CreateTruckRegisterSchema.safeParse(data);
}
