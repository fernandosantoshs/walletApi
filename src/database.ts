import { knex as knexConfig, Knex } from 'knex';

export const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: './db/app.db',
  },
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
  useNullAsDefault: true,
};

export const knex = knexConfig(config);
