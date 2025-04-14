import retry from 'async-retry';
import { database } from 'infra/database';
import { migrator } from 'models/migrator';

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100, //número máximo de tentativas,
      maxTimeout: 1000, // 1 segundo entre uma tentativa e outra
    });

    async function fetchStatusPage() {
      const response = await fetch('http://localhost:3000/api/v1/status');

      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

async function clearDatabase() {
  await database.query('drop schema public cascade; create schema public;');
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

export const orchestrator = { waitForAllServices, clearDatabase, runPendingMigrations };
