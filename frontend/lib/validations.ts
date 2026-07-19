import { z } from "zod";

export const smtpTestSchema = z.object({
  company_email: z.string().min(1, "Company email is required").email("Enter a valid email"),
  smtp_host: z.string().min(1, "SMTP host is required"),
  smtp_port: z
    .string()
    .min(1, "Port is required")
    .regex(/^\d+$/, "Enter a valid port")
    .refine((v) => Number(v) >= 1 && Number(v) <= 65535, "Enter a valid port"),
  smtp_username: z.string().min(1, "SMTP username is required"),
  smtp_password: z.string().min(1, "SMTP password is required"),
});
export type SmtpTestValues = z.infer<typeof smtpTestSchema>;

export const otpSchema = z.string().length(6, "OTP must be 6 digits");

export const createAccountSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  otp: otpSchema,
});
export type CreateAccountValues = z.infer<typeof createAccountSchema>;

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  otp: otpSchema,
});
export type LoginValues = z.infer<typeof loginSchema>;
