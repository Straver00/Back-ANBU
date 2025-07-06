import { parsedDatabaseEnv } from './env.loader';
import { DataSourceOptions } from 'typeorm';
import * as fs from 'fs';
import * as path from 'node:path';

const getCa = () => {
  const caPath = path.resolve(process.cwd(), parsedDatabaseEnv.DB_URL_CA!);
  return fs.readFileSync(caPath).toString();
};

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
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
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../migrations/**/*{.ts,.js}'],
  synchronize: false,
};
