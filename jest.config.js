const nextJest = require('next/jest');
const dotenv = require('dotenv');

//necessário para carregar as variaveis de ambiente
//dentro do jest que por padrão não carregar variaveis de ambiente dentro do ambiente de test
dotenv.config({
  path: '.env.development',
});

//configuração para o jest saber de onde parte a raiz do projeto
const createJestConfig = nextJest({
  dir: '.',
});

//configuração para que o jest consiga usar o import from mais moderno
const jestConfig = createJestConfig({
  moduleDirectories: ['node_modules', '<rootDir>'],
  testTimeout: 60000, // 6 segundos
});

module.exports = jestConfig;
