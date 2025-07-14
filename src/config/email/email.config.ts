import { registerAs } from '@nestjs/config';
import { emailSchema } from './email.schema';

export const emailConfig = registerAs('email', () => {
  const config = emailSchema.parse(process.env);
  return config;
});
