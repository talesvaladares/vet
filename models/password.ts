import bcryptjs from 'bcryptjs';

async function hash(password: string) {
  const rounds = getNumberOfRounds();
  return await bcryptjs.hash(password, rounds);
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === 'production' ? 14 : 1;
}

async function compare(providedPassword: string, storePassword: string) {
  return await bcryptjs.compare(providedPassword, storePassword);
}

export const password = {
  hash,
  compare,
};
