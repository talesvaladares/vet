import { orchestrator } from 'tests/orchestrator';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe('POST /api/v1/migrations', () => {
  describe('Running pending migrations', () => {
    test('For the first time', async () => {
      const response = await fetch('http://localhost:3000/api/v1/migrations', { method: 'POST' });
      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toBe(true);
      //deve ser maior que 0 porque é um array que mostra as migrations que foram executadas
      expect(responseBody.length).toBeGreaterThan(0);
    });

    test('For the second time', async () => {
      const response = await fetch('http://localhost:3000/api/v1/migrations', { method: 'POST' });
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toBe(true);
      //deve ser  0 porque as migrations foram executadas anterior e não esperamos mais nada
      expect(responseBody.length).toBe(0);
    });
  });
});
