import { orchestrator } from 'tests/orchestrator';
import { version as uuidVersion } from 'uuid';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe('POST /api/v1/veterinarians', () => {
  it('should return a veterinarian', async () => {
    const response = await fetch('http://localhost:3000/api/v1/veterinarians', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Ana Laura',
        surname: 'Andrade',
        email: 'ana.laura@gmail.com',
        password: 'senha123',
        phone_number: '12345678',
        veterinary_data: {
          speciality: 'Clínica Geral e Ultrassonografia',
          crmv: 'MG 12345678',
        },
      }),
    });

    expect(response.status).toBe(201);
    const responseBody = await response.json();

    expect(responseBody).toEqual({
      id: responseBody.id,
      name: 'Ana Laura',
      surname: 'Andrade',
      email: 'ana.laura@gmail.com',
      phone_number: '12345678',
      veterinary_data: {
        speciality: 'Clínica Geral e Ultrassonografia',
        crmv: 'MG 12345678',
      },
    });

    expect(uuidVersion(responseBody.id)).toBe(4);
  });

  it('should return an error if an already registered crmv is used', async () => {
    await fetch('http://localhost:3000/api/v1/veterinarians', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Ana Laura',
        surname: 'Andrade',
        email: 'ana.laura@gmail.com',
        password: 'senha123',
        phone_number: '12345678',
        veterinary_data: {
          speciality: 'Clínica Geral e Ultrassonografia',
          crmv: 'MG 12345678',
        },
      }),
    });

    const response = await fetch('http://localhost:3000/api/v1/veterinarians', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'fulana',
        surname: 'fulaninha',
        email: 'fulana@gmail.com',
        password: 'senha123',
        phone_number: '12345678',
        veterinary_data: {
          speciality: 'Clínica Geral e Ultrassonografia',
          crmv: 'MG 12345678',
        },
      }),
    });

    expect(response.status).toBe(400);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      name: 'ValidationError',
      message: 'O crmv informado já está sendo utilizado.',
      action: 'Utilize outro crmv para realizar o cadastro.',
      status_code: 400,
    });
  });
});
