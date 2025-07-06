// data-source.ts
import { DataSource } from 'typeorm';
import { typeOrmConfig } from './config/database/type-orm.config';

export const AppDataSource = new DataSource(typeOrmConfig);
