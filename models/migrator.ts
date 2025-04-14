import { resolve } from 'node:path';
import { database } from 'infra/database';
import migrationRunner from 'node-pg-migrate';
import { ServiceError } from 'infra/errors';
import { Client } from 'pg';

async function listPendingMigrations() {
  let dbClient: Client;

  try {
    const dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      dbClient,
      dryRun: true,
      direction: 'up',
      migrationsTable: 'pgmigrations',
      log: () => {},
      dir: resolve('infra', 'migrations'),
    });

    return pendingMigrations;
  } catch (error) {
    const serviceErrorObject = new ServiceError({
      message: 'Error ao rodar as migrations',
      error: error,
    });
    throw serviceErrorObject;
  } finally {
    await dbClient?.end();
  }
}

async function runPendingMigrations() {
  let dbClient: Client;

  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      dbClient,
      dryRun: false,
      direction: 'up',
      migrationsTable: 'pgmigrations',
      log: () => {},
      dir: resolve('infra', 'migrations'),
    });

    return migratedMigrations;
  } finally {
    await dbClient?.end();
  }
}

export const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};
