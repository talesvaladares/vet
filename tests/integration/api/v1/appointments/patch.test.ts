import { orchestrator } from 'tests/orchestrator';
import { addDays } from 'date-fns';

import { veterinarian as veterinarianModel } from 'models/veterinarian';
import { VeterinarianDTO } from 'types/veterinarians';

import { pet as petModel } from 'models/pet';
import { Pet } from 'types/pets';

import { user as userModel } from 'models/user';
import { User } from 'types/users';

import { getDateNow } from 'helpers/date';

import { appointment as appointmentModel } from 'models/appointment';
import { Appointment } from 'types/appointments';

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

describe('PATCH /api/v1/appointments', () => {
  it('should return a appointment with status completed', async () => {
    const responseAppointment = await fetch('http://localhost:3000/api/v1/appointments', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appointment_id: appointment.id,
        status: 'completed',
      }),
    });

    expect(responseAppointment.status).toBe(200);

    const responseAppointmentBody = await responseAppointment.json();

    expect(responseAppointmentBody).toEqual({
      id: responseAppointmentBody.id,
      status: 'completed',
    });
  });

  it('should return a appointment with status canceled', async () => {
    const responseAppointment = await fetch('http://localhost:3000/api/v1/appointments', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appointment_id: appointment.id,
        status: 'canceled',
      }),
    });

    expect(responseAppointment.status).toBe(200);

    const responseAppointmentBody = await responseAppointment.json();

    expect(responseAppointmentBody).toEqual({
      id: responseAppointmentBody.id,
      status: 'canceled',
    });
  });

  it('should return a appointment with status blocked', async () => {
    const responseAppointment = await fetch('http://localhost:3000/api/v1/appointments', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appointment_id: appointment.id,
        status: 'canceled',
      }),
    });

    expect(responseAppointment.status).toBe(200);

    const responseAppointmentBody = await responseAppointment.json();

    expect(responseAppointmentBody).toEqual({
      id: responseAppointmentBody.id,
      status: 'canceled',
    });
  });
});
