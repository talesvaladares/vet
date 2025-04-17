import { orchestrator } from 'tests/orchestrator';
import { version as uuidVersion } from 'uuid';
import { user } from 'models/user';
import { password } from 'models/password';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe('GET /api/v1/users/[email]', () => {
  describe('Anonymous user', () => {
    test('With exact case match', async () => {
      await fetch('http://localhost:3000/api/v1/users', {
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

      const response2 = await fetch('http://localhost:3000/api/v1/users/tales@gmail.com');
      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        name: 'tales',
        surname: 'eduardo',
        email: 'tales@gmail.com',
        password: response2Body.password,
        phone_number: '12345678',
        is_vet: false,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByEmail('tales@gmail.com');
      const correctPasswordMatch = await password.compare('senha123', userInDatabase.password);
      expect(correctPasswordMatch).toBe(true);

      const incorrectPasswordMatch = await password.compare('senhaErrada', userInDatabase.password);
      expect(incorrectPasswordMatch).toBe(false);
    });

    test('With case mismatch', async () => {
      await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'case',
          surname: 'diferente',
          email: 'casediferente@gmail.com',
          password: 'senha123',
          phone_number: '12345678',
        }),
      });

      const response2 = await fetch('http://localhost:3000/api/v1/users/CaseDiferente@gmail.com');
      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        name: 'case',
        surname: 'diferente',
        email: 'casediferente@gmail.com',
        password: response2Body.password,
        phone_number: '12345678',
        is_vet: false,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
    });

    test('With nonexistent email', async () => {
      const response = await fetch('http://localhost:3000/api/v1/users/usuarioInexistente');
      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: 'NotFoundError',
        message: 'O email informado não foi encontrado no sistema.',
        action: 'Verifique se o username está digitado corretamente.',
        status_code: 404,
      });
    });
  });
});
