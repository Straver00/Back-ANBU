import { registerAs } from '@nestjs/config';
import { parsedEnv } from '../env';
import { DatabaseConfig } from './database.types';
import { DATABASE_NAMESPACE } from './database.constants';

export default registerAs(DATABASE_NAMESPACE, (): DatabaseConfig => {
  const env = parsedEnv();
  return {
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    ssl: env.DB_SSL,
    ca: env.DB_URL_CA,
  };
});
