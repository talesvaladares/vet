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

export type Appointment = {
  id: string;
  available: boolean;
  date: Date;
};
