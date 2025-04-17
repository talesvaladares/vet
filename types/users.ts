export type UserInputValues = {
  name: string;
  surname: string;
  email: string;
  password: string;
  phone_number: string;
};

export type User = UserInputValues & {
  id: string;
  is_vet: boolean;
  updated_at: Date;
  created_at: Date;
};
