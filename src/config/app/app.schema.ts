// config/app/app.schema.ts
import { z } from 'zod';
import { DEFAULT_APP_PORT } from './app.constants';

export const appSchema = z.object({
  PORT: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .default(DEFAULT_APP_PORT.toString()),
});

export type AppSchema = z.infer<typeof appSchema>;
