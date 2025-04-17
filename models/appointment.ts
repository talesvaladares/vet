import { database } from 'infra/database';
import { ValidationError } from 'infra/errors';
import { AppointmentInputValues } from 'types/appointments';

async function create(appointmentInputValues: AppointmentInputValues) {
  validateDateInThePresent(appointmentInputValues.date);
  validateDateWithinRange(appointmentInputValues.date);
  await validateCompetingSchedules(appointmentInputValues.date, appointmentInputValues.vet_id);

  const newAppointment = await runInsertQuery(appointmentInputValues);
  return newAppointment;

  function validateDateInThePresent(date: Date) {
    if (new Date(date).getTime() < Date.now()) {
      throw new ValidationError({
        message: 'Não é possivel agendar uma consulta com data no passado.',
        action: 'Mande uma data válida para marcar uma consulta.',
      });
    }
  }

  function validateDateWithinRange(date: Date) {
    const hour = new Date(date).getHours();
    const minute = new Date(date).getMinutes();

    const totalMinutes = hour * 60 + minute;

    const start = 8 * 60; // 08:00 = 480
    const end = 17 * 60 + 30; // 17:30 = 1050

    if (totalMinutes < start || totalMinutes > end) {
      throw new ValidationError({
        message: 'Não é possivel agendar uma consulta antes das 8h e depois das 17:30h.',
        action: 'Mande uma data válida para marcar uma consulta.',
      });
    }
  }

  async function validateCompetingSchedules(date: Date, vet_id: string) {
    const initialDate = date;

    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          appointments
        WHERE
          vet_id = $2 and ($1 >= date OR $1 <= date + interval '30 minutes')
        LIMIT
          1
        ;`,
      values: [initialDate, vet_id],
    });

    if (results.rowCount) {
      throw new ValidationError({
        message: 'A data escolhida já está em uso.',
        action: 'Escolha uma data diferente para marcar uma consulta.',
      });
    }
  }

  async function runInsertQuery(appointmentInputValues: AppointmentInputValues) {
    const { date, pet_id, vet_id } = appointmentInputValues;

    const results = await database.query({
      text: `
        INSERT INTO
          appointments (date, pet_id, vet_id)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
        ;`,
      values: [date, pet_id, vet_id],
    });

    return results.rows[0];
  }
}

export const appointment = {
  create,
};
