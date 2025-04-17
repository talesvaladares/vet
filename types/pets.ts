type Specie = 'dog' | 'cat';

export type PetInputValues = {
  name: string;
  specie: Specie;
  brithday: Date;
  weight: number;
  user_id: string;
};

export type Pet = PetInputValues & {
  id: string;
  name: string;
  specie: Specie;
  brithday: Date;
  weight: number;
  user_id: string;
  updated_at: Date;
  created_at: Date;
};
