import { z } from "zod";

export const issueCredentialSchema = z.object({
  body: z.object({
    studentEmail: z.string().email(),
    credentialType: z.enum(["DEGREE", "DIPLOMA", "TRANSCRIPT", "MICRO_CREDENTIAL", "CERTIFICATE"]).optional(),
    title: z.string().min(1, "Title is required"),
    recipientName: z.string().min(1, "Recipient name is required"),
    issueDate: z.string().optional(),
    description: z.string().optional(),
    expiryDate: z.string().optional(),
  }),
});

export const revokeCredentialSchema = z.object({
  body: z.object({
    reason: z.string().min(1, "Reason is required"),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});
