import { exec } from 'node:child_process';

function checkPostgres() {
  //faz o pg_isready perguntar via tcp/ip se o banco está pronto
  //localhost pq o banco está em localhost
  exec('docker exec postgres-dev pg_isready --host localhost', handleReturn);

  function handleReturn(error: Error, stdout: string) {
    //quando se roda o script acima ele devolve uma mensagem como a de baixo
    //a função search procura esta mensagem, caso não encontre retorna -1
    if (stdout.search('accepting connections') === -1) {
      process.stdout.write('.');
      checkPostgres();
      return;
    }

    console.log('\n🟢 Postgres está pronto e aceitando conexões!\n');
  }
}

process.stdout.write('\n\n🔴 Aguardando Postgres aceitar conexões');

checkPostgres();
