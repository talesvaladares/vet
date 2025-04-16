import { database } from 'infra/database';
import { Pet, PetInputValues } from 'types/pets';

async function create(petInputValues: PetInputValues) {
  const newPet = await runInsertQuery(petInputValues);
  return newPet;

  async function runInsertQuery(petInputValues: PetInputValues) {
    const { name, brithday, specie, user_id, weight } = petInputValues;

    const results = await database.query({
      text: `
        INSERT INTO
          pets (name, specie, brithday, weight, user_id)
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING
          *
        ;`,
      values: [name, specie, brithday, weight, user_id],
    });

    const newPet = {
      ...results.rows[0],
      weight: Number(results.rows[0].weight),
    } as Pet;

    return newPet;
  }
}

export const pet = {
  create,
};
