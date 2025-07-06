import { z } from 'zod';
import {
  DEFAULT_SESSION_MAX_AGE,
  DEFAULT_SESSION_NAME,
  DEFAULT_SESSION_SECURE,
} from './session.constants';

export const sessionSchema = z.object({
  SESSION_SECRET: z.string().min(10),
  SESSION_NAME: z.string().default(DEFAULT_SESSION_NAME),
  SESSION_MAX_AGE: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .default(DEFAULT_SESSION_MAX_AGE.toString()),
  SESSION_SECURE: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      return val.toLowerCase() === 'true';
    })
    .default(DEFAULT_SESSION_SECURE),
});

export type SessionEnvSchema = z.infer<typeof sessionSchema>;
