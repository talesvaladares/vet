import { createRouter } from 'next-connect';
import { controller } from 'infra/controller';
import { appointment } from 'models/appointment';
import { NextApiRequest, NextApiResponse } from 'next';

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request: NextApiRequest, response: NextApiResponse) {
  const { vet_id, pet_id, date } = request.body;
  const newAppointments = await appointment.create({ vet_id, pet_id, date });
  return response.status(201).json(newAppointments);
}
