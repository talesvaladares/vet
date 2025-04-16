import { database } from 'infra/database';
import { ValidationError, NotFoundError } from 'infra/errors';
import { User, UserInputValues } from 'types/users';

async function create(userInputValues: UserInputValues) {
  await validateUniqueEmail(userInputValues.email);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

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

  async function runInsertQuery(userInputValues: UserInputValues) {
    const { name, surname, email, password, phone_number } = userInputValues;

    const results = await database.query({
      text: `
        INSERT INTO
          users (name, surname, email, password, phone_number)
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING
          *
        ;`,
      values: [name, surname, email, password, phone_number],
    });

    return results.rows[0] as User;
  }
}

async function findOneByEmail(email: string) {
  const userFound = await runSelectQuery(email);
  return userFound;

  async function runSelectQuery(email: string) {
    const results = await database.query({
      text: `
        SELECT 
          *
        FROM
          users
        WHERE 
          LOWER(email) = LOWER($1)
        LIMIT
          1
        ;`,
      values: [email],
    });

    if (results.rowCount < 1) {
      throw new NotFoundError({
        name: 'NotFoundError',
        message: 'O email informado não foi encontrado no sistema.',
        action: 'Verifique se o username está digitado corretamente.',
        statusCode: 404,
      });
    }

    return results.rows[0] as User;
  }
}

export const user = {
  create,
  findOneByEmail,
};
