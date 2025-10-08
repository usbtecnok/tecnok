import mysql from 'mysql2';

// Cria conexão com o banco de dados MariaDB
export const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // coloque sua senha se tiver
  database: 'usbtecnokcar'
});

// Testa conexão
db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('✅ Conectado ao banco de dados MariaDB com sucesso!');
  }
});
