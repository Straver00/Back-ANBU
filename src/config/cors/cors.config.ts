import { registerAs } from '@nestjs/config';
import { parsedEnv } from '../env/env.loader';
import { CorsConfig } from './cors.types';
import { CORS_NAMESPACE } from './cors.constants';

export default registerAs(
  CORS_NAMESPACE,
  (): CorsConfig => ({
    origin: parsedEnv.CORS_ORIGIN.split(',').map((o) => o.trim()),
  }),
);
