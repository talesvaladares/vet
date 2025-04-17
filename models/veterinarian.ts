import { database } from 'infra/database';
import { VeterinarianInputValues, VeterinarianDTO, Veterinarian } from 'types/veterinarians';
import { ValidationError } from 'infra/errors';
import { User, UserInputValues } from 'types/users';

type VetInputValues = {
  user_id: string;
  crmv: string;
  speciality: string;
};

async function create(veterinarianInputValues: VeterinarianInputValues) {
  await validateUniqueEmail(veterinarianInputValues.email);
  await validateUniqueCRMV(veterinarianInputValues.veterinary_data.crmv);

  const newUser = await runInsertQueryUser(veterinarianInputValues);
  const newVetData = await runInsertQueryVet({
    user_id: newUser.id,
    crmv: veterinarianInputValues.veterinary_data.crmv,
    speciality: veterinarianInputValues.veterinary_data.speciality,
  });

  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    surname: newUser.surname,
    phone_number: newUser.phone_number,
    veterinary_data: {
      crmv: newVetData.crmv,
      speciality: newVetData.speciality,
    },
  } as VeterinarianDTO;

  async function runInsertQueryUser(userInputValues: UserInputValues) {
    const { name, surname, email, password, phone_number } = userInputValues;
    const isVet = true;

    const results = await database.query({
      text: `
        INSERT INTO
          users (name, surname, email, password, phone_number, is_vet)
        VALUES
          ($1, $2, $3, $4, $5, $6)
        RETURNING
          *
        ;`,
      values: [name, surname, email, password, phone_number, isVet],
    });

    return results.rows[0] as User;
  }

  async function runInsertQueryVet({ user_id, crmv, speciality }: VetInputValues) {
    const results = await database.query({
      text: `
        INSERT INTO
          veterinarians (user_id, crmv, speciality)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
        ;`,
      values: [user_id, crmv, speciality],
    });

    return results.rows[0] as Veterinarian;
  }

  async function validateUniqueEmail(email: string) {
    const results = await database.query({
      text: `
        SELECT 
          email
        FROM
          users
        WHERE 
          LOWER(email) = LOWER($1)
        ;`,
      values: [email],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        message: 'O email informado já está sendo utilizado.',
        action: 'Utilize outro email para realizar o cadastro.',
      });
    }
  }

  async function validateUniqueCRMV(crmv: string) {
    const results = await database.query({
      text: `
        SELECT 
          crmv
        FROM
          veterinarians
        WHERE 
          LOWER(crmv) = LOWER($1)
        ;`,
      values: [crmv],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        message: 'O crmv informado já está sendo utilizado.',
        action: 'Utilize outro crmv para realizar o cadastro.',
      });
    }
  }
}

export const veterinarian = {
  create,
};
