// config/env.validation.ts
import { envSchema, EnvSchema } from './env.schema';

export function validateEnv(config: Record<string, unknown>): EnvSchema {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    console.error(
      '❌ Error en variables de entorno:',
      JSON.stringify(result.error.format(), null, 2),
    );
    throw new Error('Invalid environment configuration');
  }
  return result.data;
}
