import { envSchema } from './env.schema';

export const parsedEnv = envSchema.parse(process.env);
