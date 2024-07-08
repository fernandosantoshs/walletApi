import 'dotenv/config';
import { knex as knexConfig, Knex } from 'knex';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL env not found');
}

export const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: process.env.DATABASE_URL,
  },
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
  useNullAsDefault: true,
};

export const knex = knexConfig(config);
