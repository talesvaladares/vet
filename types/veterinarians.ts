export type VeterinarianDTO = {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone_number: string;
  veterinary_data: VeterinaryData;
};

export type VeterinaryData = {
  speciality: string;
  crmv: string;
};

export type VeterinarianInputValues = {
  name: string;
  surname: string;
  email: string;
  password: string;
  phone_number: string;
  veterinary_data: VeterinaryData;
};

export type Veterinarian = {
  id: string;
  crmv: string;
  speciality: string;
  created_at: Date;
  updated_at: Date;
};
