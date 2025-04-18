export type AppointmentInputValues = {
  pet_id: string;
  vet_id: string;
  date: Date;
};

export type Schedule = {
  day: string;
  date: Date;
  appointments: Appointment[];
};

export type AppointmentStatus = 'schedule' | 'completed' | 'blocked' | 'canceled';

export type Appointment = {
  id: string;
  available: boolean;
  date: Date;
  status: AppointmentStatus;
};
