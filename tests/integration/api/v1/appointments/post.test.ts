import { orchestrator } from 'tests/orchestrator';
import { version as uuidVersion } from 'uuid';
import { addDays, subDays } from 'date-fns';

import { veterinarian as veterinarianModel } from 'models/veterinarian';
import { VeterinarianDTO } from 'types/veterinarians';

import { pet as petModel } from 'models/pet';
import { Pet } from 'types/pets';

import { user as userModel } from 'models/user';
import { User } from 'types/users';

import { addHours } from 'date-fns';
import { getDateNow } from 'helpers/date';

let veterinarian: VeterinarianDTO;
let pet: Pet;
let user: User;

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
});

afterEach(() => {
  jest.useRealTimers();
});

describe('POST /api/v1/appointments', () => {
  it('should return appointment', async () => {
    const tomorrow = addDays(getDateNow(), 1);

    const responseAppointment = await fetch('http://localhost:3000/api/v1/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vet_id: veterinarian.id,
        pet_id: pet.id,
        date: tomorrow,
      }),
    });

    expect(responseAppointment.status).toBe(201);

    const responseAppointmentBody = await responseAppointment.json();

    expect(responseAppointmentBody).toEqual({
      id: responseAppointmentBody.id,
      vet_id: veterinarian.id,
      pet_id: pet.id,
      date: responseAppointmentBody.date,
      status: 'scheduled',
      created_at: responseAppointmentBody.created_at,
      updated_at: responseAppointmentBody.updated_at,
    });

    expect(uuidVersion(responseAppointmentBody.vet_id)).toBe(4);
    expect(uuidVersion(responseAppointmentBody.pet_id)).toBe(4);
    expect(Date.parse(responseAppointmentBody.created_at)).not.toBeNaN();
    expect(Date.parse(responseAppointmentBody.updated_at)).not.toBeNaN();
  });

  it('should return error when sent a past date', async () => {
    jest.useFakeTimers();
    const systemTime = new Date(getDateNow()); //meio dia
    jest.setSystemTime(systemTime);

    const dateInThePast = subDays(systemTime, 1);

    const responseAppointment = await fetch('http://localhost:3000/api/v1/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vet_id: veterinarian.id,
        pet_id: pet.id,
        date: dateInThePast,
      }),
    });

    expect(responseAppointment.status).toBe(400);

    const responseAppointmentBody = await responseAppointment.json();

    expect(responseAppointmentBody).toEqual({
      message: 'Não é possivel agendar uma consulta com data no passado.',
      action: 'Mande uma data válida para marcar uma consulta.',
      name: 'ValidationError',
      status_code: 400,
    });
  });

  it('should return an error if you try to schedule after of business hours', async () => {
    jest.useFakeTimers();
    const systemTime = new Date(getDateNow()); //8 horas
    jest.setSystemTime(systemTime);

    const invalidDate = addHours(systemTime, 10);

    const responseAppointment = await fetch('http://localhost:3000/api/v1/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vet_id: veterinarian.id,
        pet_id: pet.id,
        date: invalidDate,
      }),
    });

    expect(responseAppointment.status).toBe(400);

    const responseAppointmentBody = await responseAppointment.json();

    expect(responseAppointmentBody).toEqual({
      message: 'Não é possivel agendar uma consulta antes das 8h e depois das 17:30h.',
      action: 'Mande uma data válida para marcar uma consulta.',
      name: 'ValidationError',
      status_code: 400,
    });

    expect(Date.now()).toBe(systemTime.getTime());
  });

  it('should return an error if you try to schedule before of business hours', async () => {
    jest.useFakeTimers();
    const systemTime = new Date(2025, 3, 17, 12, 0); //meio dia
    jest.setSystemTime(systemTime);

    const invalidDate = new Date(2025, 3, 18, 7, 32);

    const responseAppointment = await fetch('http://localhost:3000/api/v1/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vet_id: veterinarian.id,
        pet_id: pet.id,
        date: invalidDate,
      }),
    });

    expect(responseAppointment.status).toBe(400);

    const responseAppointmentBody = await responseAppointment.json();

    expect(responseAppointmentBody).toEqual({
      message: 'Não é possivel agendar uma consulta antes das 8h e depois das 17:30h.',
      action: 'Mande uma data válida para marcar uma consulta.',
      name: 'ValidationError',
      status_code: 400,
    });
  });

  it('should return an error if you try to schedule at an already scheduled time', async () => {
    jest.useFakeTimers();
    const systemTime = new Date(getDateNow()); //meio dia
    jest.setSystemTime(systemTime);

    const validDate = new Date(2025, 3, 18, 9, 30); // 9 horas
    const invalidDate = new Date(2025, 3, 18, 9, 45); //9:20 horas

    const responseAppointmentValid = await fetch('http://localhost:3000/api/v1/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vet_id: veterinarian.id,
        pet_id: pet.id,
        date: validDate,
      }),
    });

    expect(responseAppointmentValid.status).toBe(201);

    const responseAppointmentInvalid = await fetch('http://localhost:3000/api/v1/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vet_id: veterinarian.id,
        pet_id: pet.id,
        date: invalidDate,
      }),
    });

    expect(responseAppointmentInvalid.status).toBe(400);

    const responseAppointmentBody = await responseAppointmentInvalid.json();

    expect(responseAppointmentBody).toEqual({
      message: 'A data escolhida já está em uso.',
      action: 'Escolha uma data diferente para marcar uma consulta.',
      name: 'ValidationError',
      status_code: 400,
    });

    const veterinarianWithFreeSchedule = await veterinarianModel.create({
      email: 'vetFree@gmail',
      name: 'vetFree',
      surname: 'fulaninhaFree',
      password: 'senha1234',
      phone_number: '123455678',
      veterinary_data: {
        crmv: 'MG 223456789',
        speciality: 'Clínica',
      },
    });

    const responseAppointmentWithOtherVeterinarianWithFreeSchedule = await fetch('http://localhost:3000/api/v1/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vet_id: veterinarianWithFreeSchedule.id,
        pet_id: pet.id,
        date: invalidDate,
      }),
    });

    expect(responseAppointmentWithOtherVeterinarianWithFreeSchedule.status).toBe(201);

    const responseAppointmentWithOtherVeterinarianWithFreeScheduleBody = await responseAppointmentWithOtherVeterinarianWithFreeSchedule.json();

    expect(responseAppointmentWithOtherVeterinarianWithFreeScheduleBody).toEqual({
      id: responseAppointmentWithOtherVeterinarianWithFreeScheduleBody.id,
      vet_id: veterinarianWithFreeSchedule.id,
      pet_id: pet.id,
      date: responseAppointmentWithOtherVeterinarianWithFreeScheduleBody.date,
      status: 'scheduled',
      created_at: responseAppointmentWithOtherVeterinarianWithFreeScheduleBody.created_at,
      updated_at: responseAppointmentWithOtherVeterinarianWithFreeScheduleBody.updated_at,
    });
  });
});
