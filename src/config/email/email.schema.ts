import { z } from 'zod';

export const emailSchema = z.object({
  EMAIL_USER: z.string().email('EMAIL_USER debe ser un email válido'),
  EMAIL_PASS: z.string().min(1, 'EMAIL_PASS es obligatorio'),
});

export type EmailConfig = z.infer<typeof emailSchema>;
