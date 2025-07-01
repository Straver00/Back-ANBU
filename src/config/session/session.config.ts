import { registerAs } from '@nestjs/config';
import { SessionConfig } from './session.types';
import { parsedEnv } from '../env/env.loader';
import { SESSION_NAMESPACE } from './session.constants';

export default registerAs(
  SESSION_NAMESPACE,
  (): SessionConfig => ({
    secret: parsedEnv.SESSION_SECRET,
    name: parsedEnv.SESSION_NAME,
    maxAge: parsedEnv.SESSION_MAX_AGE,
    secure: parsedEnv.SESSION_SECURE,
  }),
);
