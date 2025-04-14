import { Client, QueryConfig } from 'pg';
import { ServiceError } from 'infra/errors';

async function query(queryObject: QueryConfig | string) {
  let client: Client;

  try {
    client = await getNewClient();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    const serviceErrorObject = new ServiceError({
      message: 'Erro na conexão com Banco ou na Query',
      cause: error,
    });
    throw serviceErrorObject;
  } finally {
    await client?.end();
  }
}

function getSSLValue() {
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA,
    };
  }
  return process.env.NODE_ENV === 'production' ? true : false;
}

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: getSSLValue(),
  });

  await client.connect();
  return client;
}
export const database = {
  query,
  getNewClient,
};
