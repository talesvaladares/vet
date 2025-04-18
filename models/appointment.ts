import { database } from 'infra/database';
import { InternalServerError, ValidationError } from 'infra/errors';
import { Appointment, AppointmentInputValues, Schedule } from 'types/appointments';
import { startOfWeek as startOfWeekFunc, endOfWeek as endOfWeekFunc, addDays, differenceInMinutes, addMinutes, isSameDay, isBefore } from 'date-fns';
import { getDateNow } from 'helpers/date';

type listAvailableSlotsInputValues = {
  vet_id: string;
  date: Date;
};

type BlockedSlot = {
  id: string;
  date: Date;
  vet_id: string;
  pet_id: string;
};

async function create(appointmentInputValues: AppointmentInputValues) {
  validateDateInThePresent(appointmentInputValues.date);
  validateDateWithinRange(appointmentInputValues.date);
  await validateCompetingSchedules(appointmentInputValues.date, appointmentInputValues.vet_id);

  const newAppointment = await runInsertQuery(appointmentInputValues);
  return newAppointment;

  function validateDateInThePresent(date: Date) {
    const now = getDateNow();
    if (isBefore(date, now)) {
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
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          appointments
        WHERE
          vet_id = $1 and ($2 >= date AND $2 <= date + interval '30 minutes')
        LIMIT
          1
        ;`,
      values: [vet_id, date],
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

async function listAvailableSlots({ vet_id, date }: listAvailableSlotsInputValues) {
  const blockedSlots = await runSelectQuery({ vet_id, date });
  const schedule = generateSchedule(date, vet_id);

  const agendaWithUnavailableTimes = generateScheduleWithBlockedSlots(blockedSlots, schedule);

  return agendaWithUnavailableTimes;

  function generateSchedule(date: Date, vet_id: string): Schedule[] {
    try {
      const startOfWeek = startOfWeekFunc(date);
      const currentDate = startOfWeek;

      const daysOfWeek = Array.from({ length: 7 }, (_, index) => ({
        date: new Date(addDays(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()), index)),
        vet_id,
      }));

      const startDay = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate(), 8);
      const endDay = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate(), 17, 30);
      const minutesAvailablesInDay = differenceInMinutes(endDay, startDay);

      const minutesOfConsultationDuration = 30;
      const numberMaxAppointments = minutesAvailablesInDay / minutesOfConsultationDuration;

      const days = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

      return daysOfWeek.map((day) => {
        const appointments = Array.from(
          { length: numberMaxAppointments },
          (_, index) =>
            ({
              id: '',
              available: true,
              date: new Date(addMinutes(day.date, index * 30)),
            }) as Appointment,
        );

        return {
          day: days[day.date.getDay()],
          date: new Date(day.date),
          appointments: appointments,
        };
      });
    } catch (error) {
      throw new InternalServerError({
        error: error,
        message: 'Aconteceu um erro ao gerar a agenda.',
        action: 'Entre em contato com o suporte.',
      });
    }
  }

  function generateScheduleWithBlockedSlots(blockedSlots: BlockedSlot[], schedule: Schedule[]): Schedule[] {
    function compareHourAndMinutes(leftDate: Date, rightDate: Date) {
      const hourLeft = leftDate.getHours();
      const minutesLeft = leftDate.getMinutes();
      const hourRight = rightDate.getHours();
      const minutesRight = rightDate.getMinutes();
      return hourLeft === hourRight && minutesLeft === minutesRight;
    }

    try {
      blockedSlots.forEach((unavailableTimesItem, index) => {
        const indexAgenda = schedule.findIndex((agendaItem) => isSameDay(agendaItem.date, unavailableTimesItem.date));

        if (indexAgenda > -1) {
          const indexSchecule = schedule[indexAgenda].appointments.findIndex((schedulesItem) => compareHourAndMinutes(blockedSlots[index].date, schedulesItem.date));
          if (indexSchecule > -1) {
            schedule[indexAgenda].appointments[indexSchecule].available = false;
            schedule[indexAgenda].appointments[indexSchecule].id = blockedSlots[index].id;
          }
        }
      });

      return schedule;
    } catch (error) {
      throw new InternalServerError({
        error: error,
        message: 'Aconteceu um erro ao gerar a agenda completa.',
        action: 'Entre em contato com o suporte.',
      });
    }
  }

  async function runSelectQuery({ vet_id, date }: listAvailableSlotsInputValues) {
    const startOfWeek = startOfWeekFunc(date);
    const endOfWeek = endOfWeekFunc(date);

    const results = await database.query({
      text: `
        SELECT
          id, date, vet_id, pet_id
        FROM
          appointments
        WHERE
          vet_id = $1 AND (date BETWEEN $2 AND $3) 
        ;`,
      values: [vet_id, startOfWeek, endOfWeek],
    });

    return results.rows as BlockedSlot[];
  }
}

export const appointment = {
  create,
  listAvailableSlots,
};
