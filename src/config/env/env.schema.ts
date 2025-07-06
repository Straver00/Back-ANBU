import { z } from 'zod';
import { appSchema } from '../app';
import { databaseSchema } from '../database';
import { sessionSchema } from '../session';
import { corsSchema } from '../cors';
import * as fs from 'fs';

export const envSchema = appSchema
  .merge(databaseSchema)
  .merge(sessionSchema)
  .merge(corsSchema)
  .superRefine((env, ctx) => {
    if (env.DB_SSL) {
      if (!env.DB_URL_CA || env.DB_URL_CA.trim() === '') {
        ctx.addIssue({
          path: ['DB_URL_CA'],
          code: z.ZodIssueCode.custom,
          message: 'DB_URL_CA es obligatorio cuando DB_SSL es true',
        });
      } else if (!/^[./\\\w-]+\.pem$/.test(env.DB_URL_CA)) {
        ctx.addIssue({
          path: ['DB_URL_CA'],
          code: z.ZodIssueCode.custom,
          message: 'DB_URL_CA debe ser una ruta válida a un archivo .pem',
        });
      } else if (!fs.existsSync(env.DB_URL_CA)) {
        ctx.addIssue({
          path: ['DB_URL_CA'],
          code: z.ZodIssueCode.custom,
          message: `El archivo especificado en DB_URL_CA no existe: ${env.DB_URL_CA}`,
        });
      }
    }
  });

export type EnvSchema = z.infer<typeof envSchema>;
