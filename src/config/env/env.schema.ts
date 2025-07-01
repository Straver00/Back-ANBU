import { z } from 'zod';
import { appSchema } from '../app';
import { databaseSchema } from '../database';
import { sessionSchema } from '../session';
import { corsSchema } from '../cors';

export const envSchema = appSchema
  .merge(databaseSchema)
  .merge(sessionSchema)
  .merge(corsSchema);

export type EnvSchema = z.infer<typeof envSchema>;
