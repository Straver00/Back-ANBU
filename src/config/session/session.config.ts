import { registerAs } from '@nestjs/config';
import { SessionConfig } from './session.types';
import { parsedEnv } from '../env';
import { SESSION_NAMESPACE } from './session.constants';

export default registerAs(SESSION_NAMESPACE, (): SessionConfig => {
  const env = parsedEnv();
  return {
    secret: env.SESSION_SECRET,
    name: env.SESSION_NAME,
    maxAge: env.SESSION_MAX_AGE,
    secure: env.SESSION_SECURE,
  };
});
