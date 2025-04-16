import { createRouter } from 'next-connect';
import { controller } from 'infra/controller';
import { user } from 'models/user';
import { NextApiRequest, NextApiResponse } from 'next';

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request: NextApiRequest, response: NextApiResponse) {
  const email = request.query.email as string;
  const userFound = await user.findOneByEmail(email);
  return response.status(200).json(userFound);
}
