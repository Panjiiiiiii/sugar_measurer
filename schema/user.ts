import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must not exceed 255 characters")
    .trim(),
  email: z
    .string()
    .email("Email format is invalid")
    .max(255, "Email must not exceed 255 characters")
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one digit"),
  role: z.enum(["branch", "master", "finance"], {
    message: "Role must be one of: branch, master, finance",
  }),
  location_id: z.string().min(1, "Location ID is required").trim(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export function validateCreateUserInput(data: unknown) {
  return CreateUserSchema.parse(data);
}

export function validateCreateUserInputSafe(data: unknown) {
  return CreateUserSchema.safeParse(data);
}
