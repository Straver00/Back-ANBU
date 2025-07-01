import { registerAs } from '@nestjs/config';
import { parsedEnv } from '../env/env.loader';
import { DatabaseConfig } from './database.types';
import { DATABASE_NAMESPACE } from './database.constants';

export default registerAs(
  DATABASE_NAMESPACE,
  (): DatabaseConfig => ({
    host: parsedEnv.DB_HOST,
    port: parsedEnv.DB_PORT,
    username: parsedEnv.DB_USERNAME,
    password: parsedEnv.DB_PASSWORD,
    database: parsedEnv.DB_DATABASE,
    ssl: parsedEnv.DB_SSL,
  }),
);
