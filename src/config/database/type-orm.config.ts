import { DataSourceOptions } from 'typeorm';
import { basePostgresConfig } from './db-base.config';

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  ...basePostgresConfig,
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../migrations/**/*{.ts,.js}'],
  synchronize: false,
};
