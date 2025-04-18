import { createRouter } from 'next-connect';
import { controller } from 'infra/controller';
import { appointment } from 'models/appointment';
import { NextApiRequest, NextApiResponse } from 'next';

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request: NextApiRequest, response: NextApiResponse) {
  const pet_id = request.query.pet_id as string;
  const appointments = await appointment.listAppointmentsForAPet(pet_id);
  return response.status(200).json(appointments);
}
