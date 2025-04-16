import { createRouter } from 'next-connect';
import { controller } from 'infra/controller';
import { pet } from 'models/pet';
import { NextApiRequest, NextApiResponse } from 'next';

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request: NextApiRequest, response: NextApiResponse) {
  const petInputValues = request.body;
  const newPet = await pet.create(petInputValues);
  return response.status(201).json(newPet);
}
