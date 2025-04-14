import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { controller } from 'infra/controller';
import { migrator } from 'models/migrator';

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request: NextApiRequest, response: NextApiResponse) {
  const pendingMigrations = await migrator.listPendingMigrations();
  return response.status(200).json(pendingMigrations);
}

async function postHandler(request: NextApiRequest, response: NextApiResponse) {
  const migratedMigrations = await migrator.runPendingMigrations();
  const status = migratedMigrations.length > 0 ? 201 : 200;
  return response.status(status).json(migratedMigrations);
}
