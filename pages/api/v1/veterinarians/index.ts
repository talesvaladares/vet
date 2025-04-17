import { createRouter } from 'next-connect';
import { controller } from 'infra/controller';
import { veterinarian } from 'models/veterinarian';
import { NextApiRequest, NextApiResponse } from 'next';

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request: NextApiRequest, response: NextApiResponse) {
  const vetInputValues = request.body;
  const newVet = await veterinarian.create(vetInputValues);
  return response.status(201).json(newVet);
}
