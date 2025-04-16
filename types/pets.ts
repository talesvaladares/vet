type Specie = 'cachorro' | 'gato';

export type PetInputValues = {
  name: string;
  specie: Specie;
  brithday: Date;
  weight: number;
  user_id: number;
};

export type Pet = PetInputValues & {
  name: string;
  specie: Specie;
  brithday: Date;
  weight: number;
  user_id: number;
  updated_at: Date;
  created_at: Date;
};
