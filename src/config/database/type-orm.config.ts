import { parsedDatabaseEnv } from './env.loader';
import { DataSourceOptions } from 'typeorm';
export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: parsedDatabaseEnv.DB_HOST,
  port: parsedDatabaseEnv.DB_PORT,
  username: parsedDatabaseEnv.DB_USERNAME,
  password: parsedDatabaseEnv.DB_PASSWORD,
  database: parsedDatabaseEnv.DB_DATABASE,
  ssl: parsedDatabaseEnv.DB_SSL,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../migrations/**/*{.ts,.js}'],
  synchronize: false,
};
