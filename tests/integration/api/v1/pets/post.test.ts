import { orchestrator } from 'tests/orchestrator';
import { version as uuidVersion } from 'uuid';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe('POST /api/v1/pets', () => {
  describe('Logged user', () => {
    test('With unique and valid data', async () => {
      const responseUser = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'tales',
          surname: 'eduardo',
          email: 'tales@gmail.com',
          password: 'senha123',
          phone_number: '12345678',
        }),
      });

      const responseUserBody = await responseUser.json();

      const brithday = new Date();
      const responsePet = await fetch('http://localhost:3000/api/v1/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'zakk',
          specie: 'cachorro',
          brithday: brithday,
          weight: 30,
          user_id: responseUserBody.id,
        }),
      });

      expect(responsePet.status).toBe(201);

      const responsePetBody = await responsePet.json();

      expect(responsePetBody).toEqual({
        id: responsePetBody.id,
        name: 'zakk',
        specie: 'cachorro',
        brithday: brithday.toISOString(),
        weight: 30,
        user_id: responseUserBody.id,
        created_at: responsePetBody.created_at,
        updated_at: responsePetBody.updated_at,
      });

      expect(uuidVersion(responsePetBody.id)).toBe(4);
      expect(Date.parse(responsePetBody.created_at)).not.toBeNaN();
      expect(Date.parse(responsePetBody.updated_at)).not.toBeNaN();
    });
  });
});
