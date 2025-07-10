// db.config.base.ts
import * as fs from 'fs';
import * as path from 'path';
import { parsedDatabaseEnv } from './env.loader';
import { PoolConfig } from 'pg';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

const getCa = () => {
  const caPath = path.resolve(process.cwd(), parsedDatabaseEnv.DB_URL_CA!);
  return fs.readFileSync(caPath).toString();
};

export const basePostgresConfig: Partial<PostgresConnectionOptions> &
  PoolConfig = {
  host: parsedDatabaseEnv.DB_HOST,
  port: parsedDatabaseEnv.DB_PORT,
  username: parsedDatabaseEnv.DB_USERNAME,
  password: parsedDatabaseEnv.DB_PASSWORD,
  database: parsedDatabaseEnv.DB_DATABASE,
  ssl: parsedDatabaseEnv.DB_SSL
    ? {
        rejectUnauthorized: true,
        ca: getCa(),
      }
    : undefined,
};
