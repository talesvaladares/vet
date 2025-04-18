import { createRouter } from 'next-connect';
import { controller } from 'infra/controller';
import { appointment } from 'models/appointment';
import { NextApiRequest, NextApiResponse } from 'next';

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request: NextApiRequest, response: NextApiResponse) {
  const vet_id = request.query.vet_id as string;
  const date = new Date(request.query.d as string);

  const listAvailableTimes = await appointment.listAvailableSlots({ vet_id, date });
  return response.status(200).json(listAvailableTimes);
}
