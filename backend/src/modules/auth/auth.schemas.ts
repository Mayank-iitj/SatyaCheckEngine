import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
  }),
});

export const registerInitSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const registerVerifySchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    name: z.string().min(2),
    password: z.string().min(8, "Password must be at least 8 characters long"),
  }),
});
