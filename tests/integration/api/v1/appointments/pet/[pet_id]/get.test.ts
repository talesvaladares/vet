import { addDays } from 'date-fns';
import { orchestrator } from 'tests/orchestrator';

import { veterinarian as veterinarianModel } from 'models/veterinarian';
import { VeterinarianDTO } from 'types/veterinarians';

import { pet as petModel } from 'models/pet';
import { Pet } from 'types/pets';

import { user as userModel } from 'models/user';
import { User } from 'types/users';

import { appointment as appointmentModel } from 'models/appointment';
import { Appointment } from 'types/appointments';
import { getDateNow } from 'helpers/date';

let veterinarian: VeterinarianDTO;
let pet: Pet;
let user: User;
let appointment: Appointment;

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

beforeEach(async () => {
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();

  user = await userModel.create({
    name: 'fulano',
    email: 'fulano@gmail.com',
    password: '12345678',
    phone_number: '123456789',
    surname: 'cicrano',
  });

  veterinarian = await veterinarianModel.create({
    email: 'vet@gmail',
    name: 'vet',
    surname: 'fulaninha',
    password: 'senha1234',
    phone_number: '123455678',
    veterinary_data: {
      crmv: 'MG 123456789',
      speciality: 'Clínica',
    },
  });

  pet = await petModel.create({
    brithday: new Date(),
    name: 'toto',
    specie: 'dog',
    weight: 20,
    user_id: user.id,
  });

  const tomorrow = addDays(getDateNow(), 1);
  appointment = await appointmentModel.create({
    date: tomorrow,
    pet_id: pet.id,
    vet_id: veterinarian.id,
  });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('GET /api/v1/appointments/vet_id/[pet_id]', () => {
  it('should return a list of appointments for a pet', async () => {
    const response = await fetch(`http://localhost:3000/api/v1/appointments/pet/${pet.id}`);
    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBeGreaterThan(0);
    expect(responseBody[0]).toEqual({
      id: appointment.id,
      date: responseBody[0].date,
      status: 'scheduled',
    });
  });
});
