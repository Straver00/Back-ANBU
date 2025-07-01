import { z } from 'zod';
import { databaseSchema } from '../database';
import { sessionSchema } from '../session';
import { corsSchema } from '../cors';

export const envSchema = z
  .object({
    PORT: z.string().regex(/^\d+$/).transform(Number),
  })
  .merge(databaseSchema)
  .merge(sessionSchema)
  .merge(corsSchema);

export type EnvSchema = z.infer<typeof envSchema>;
