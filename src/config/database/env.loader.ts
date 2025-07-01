import { config } from 'dotenv';
import { databaseSchema } from './database.schema';
config();

const result = databaseSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Error en las variables de entorno de la base de datos:');
  console.error(result.error.format());
  process.exit(1);
}

export const parsedDatabaseEnv = result.data;
