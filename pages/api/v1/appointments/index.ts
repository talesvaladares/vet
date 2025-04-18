import { createRouter } from 'next-connect';
import { controller } from 'infra/controller';
import { appointment } from 'models/appointment';
import { NextApiRequest, NextApiResponse } from 'next';

const router = createRouter();

router.post(postHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request: NextApiRequest, response: NextApiResponse) {
  const { vet_id, pet_id, date } = request.body;
  const newAppointments = await appointment.create({ vet_id, pet_id, date });
  return response.status(201).json(newAppointments);
}

async function patchHandler(request: NextApiRequest, response: NextApiResponse) {
  const { appointment_id, status } = request.body;
  const updatedAppointment = await appointment.update({ appointment_id, status });
  return response.status(200).json(updatedAppointment);
}
