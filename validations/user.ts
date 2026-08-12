// validations\user.ts
import { z } from "zod";

// 8-20 chars, at least one uppercase, one lowercase, one digit, one special character
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/;

const strongPasswordMessage =
  "Password must be 8-20 characters and include an uppercase letter, a lowercase letter, a number, and a special character.";

export const createUserSchema = z
  .object({
    full_name: z.string().trim().min(2, "Full name must be at least 2 characters."),
    email: z.string().trim().email("Enter a valid email address."),
    password: z.string().regex(strongPasswordRegex, strongPasswordMessage),
    confirm_password: z.string().min(1, "Please confirm your password."),
    phone: z
      .string()
      .trim()
      .regex(/^\d{11}$/, "Phone number must be exactly 11 digits.")
      .optional()
      .or(z.literal("")),
    role_id: z.string().optional().or(z.literal("")),
    is_super_admin: z.boolean(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  })
  .refine((data) => data.is_super_admin || !!data.role_id, {
    message: "Please select a role.",
    path: ["role_id"],
  });

export type CreateUserForm = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    full_name: z.string().trim().min(2, "Full name must be at least 2 characters."),
    email: z.string().trim().email("Enter a valid email address."),
    password: z
      .string()
      .regex(strongPasswordRegex, strongPasswordMessage)
      .optional()
      .or(z.literal("")),
    confirm_password: z.string().optional().or(z.literal("")),
    phone: z
      .string()
      .trim()
      .regex(/^\d{11}$/, "Phone number must be exactly 11 digits.")
      .optional()
      .or(z.literal("")),
    role_id: z.string().optional().or(z.literal("")),
    is_super_admin: z.boolean(),
    is_active: z.boolean(),
  })
  .refine(
    (data) => {
      if (!data.password) return true;
      return data.password === data.confirm_password;
    },
    { message: "Passwords do not match.", path: ["confirm_password"] }
  )
  .refine((data) => data.is_super_admin || !!data.role_id, {
    message: "Please select a role.",
    path: ["role_id"],
  });

export type UpdateUserForm = z.infer<typeof updateUserSchema>;