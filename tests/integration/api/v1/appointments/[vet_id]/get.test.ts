import { orchestrator } from 'tests/orchestrator';

import { veterinarian as veterinarianModel } from 'models/veterinarian';
import { VeterinarianDTO } from 'types/veterinarians';

import { pet as petModel } from 'models/pet';
import { Pet } from 'types/pets';

import { user as userModel } from 'models/user';
import { User } from 'types/users';

import { appointment } from 'models/appointment';
import { addDays, addHours, isEqual } from 'date-fns';
import { getDateNow } from 'helpers/date';
import { Schedule } from 'types/appointments';

let veterinarian: VeterinarianDTO;
let pet: Pet;
let user: User;

beforeAll(async () => {
  await orchestrator.waitForAllServices();
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
});

afterEach(() => {
  jest.useRealTimers();
});

describe('GET /api/v1/appointments/vet_id', () => {
  it('should return a list of available times', async () => {
    jest.useFakeTimers();
    const systemTime = getDateNow();
    jest.setSystemTime(systemTime);

    await appointment.create({
      date: addHours(getDateNow(), 1),
      pet_id: pet.id,
      vet_id: veterinarian.id,
    });

    await appointment.create({
      date: addHours(getDateNow(), 2),
      pet_id: pet.id,
      vet_id: veterinarian.id,
    });

    await appointment.create({
      date: addDays(getDateNow(), 2),
      pet_id: pet.id,
      vet_id: veterinarian.id,
    });

    const appointmentDate = addDays(getDateNow(), 3);
    const response = await fetch(`http://localhost:3000/api/v1/appointments/${veterinarian.id}?d=${appointmentDate.toISOString()}`);

    expect(response.status).toBe(200);

    const responseBody = (await response.json()) as Schedule[];

    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBe(7);

    const atLeastOneUnavailable = responseBody.find((item) => item.appointments.find((appointment) => isEqual(appointment.date, addHours(getDateNow(), 1)) && appointment.available === false));
    expect(!!atLeastOneUnavailable).toBe(true);

    expect(responseBody).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          day: expect.any(String),
          date: expect.any(String),
          appointments: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              available: expect.any(Boolean),
              date: expect.any(String),
            }),
          ]),
        }),
      ]),
    );
  });
});
