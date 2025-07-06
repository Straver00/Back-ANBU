import { z } from 'zod';
import { DEFAULT_DB_PORT, DEFAULT_DB_SSL } from './database.constants';

export const databaseSchema = z.object({
  DB_HOST: z.string().min(1, 'DB_HOST es obligatorio'),
  DB_PORT: z
    .string()
    .regex(/^\d+$/, 'DB_PORT debe ser un número válido')
    .transform(Number)
    .default(DEFAULT_DB_PORT.toString()),

  DB_USERNAME: z.string().min(1, 'DB_USERNAME es obligatorio'),
  DB_PASSWORD: z.string().min(1, 'DB_PASSWORD es obligatorio'),
  DB_DATABASE: z.string().min(1, 'DB_DATABASE es obligatorio'),

  // Para conexiones seguras con Postgres en producción
  DB_SSL: z
    .preprocess((val) => val === 'true' || val === true, z.boolean())
    .default(DEFAULT_DB_SSL),

  DB_URL_CA: z.string().optional(), // validación condicional después
});

export type DatabaseEnvSchema = z.infer<typeof databaseSchema>;
