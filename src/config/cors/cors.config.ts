import { registerAs } from '@nestjs/config';
import { parsedEnv } from '../env';
import { CorsConfig } from './cors.types';
import { CORS_NAMESPACE } from './cors.constants';

export default registerAs(CORS_NAMESPACE, (): CorsConfig => {
  const env = parsedEnv();
  return {
    origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
  };
});
