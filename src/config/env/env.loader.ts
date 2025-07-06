import { envSchema } from './env.schema';
import { z } from 'zod';

export const parsedEnv = (): z.infer<typeof envSchema> => {
  return envSchema.parse(process.env);
};
