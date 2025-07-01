import { z } from 'zod';
import { DEFAULT_CORS_ORIGIN } from './cors.constants';

export const corsSchema = z.object({
  CORS_ORIGIN: z
    .string()
    .min(1)
    .default(DEFAULT_CORS_ORIGIN)
    .refine(
      (val) => {
        const origins = val.split(',').map((o) => o.trim());
        return origins.every(
          (origin) => origin === '*' || /^https?:\/\/.+$/.test(origin),
        );
      },
      {
        message:
          'CORS_ORIGIN debe contener URLs válidas separadas por comas o "*"',
      },
    ),
});

export type CorsEnvSchema = z.infer<typeof corsSchema>;
