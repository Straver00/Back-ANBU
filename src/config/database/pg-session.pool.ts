import { Pool } from 'pg';
import { basePostgresConfig } from './db-base.config';

export const pgSessionPool = new Pool({
  ...basePostgresConfig,
  user: basePostgresConfig.username,
});
