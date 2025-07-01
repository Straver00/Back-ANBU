import { registerAs } from '@nestjs/config';
import { parsedEnv } from '../env';
import { APP_NAMESPACE } from './app.constants';
import { AppConfig } from './app.types';

export default registerAs(APP_NAMESPACE, (): AppConfig => {
  const env = parsedEnv();
  return {
    port: env.PORT,
  };
});
