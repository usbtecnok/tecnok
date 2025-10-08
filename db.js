import mysql from 'mysql';

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'usbtecnok',
  password: process.env.DB_PASSWORD || '@#*Z4939ia4',
  database: process.env.DB_NAME || 'usbtecnokcar'
});

db.connect(err => {
  if (err) console.error('❌ Erro ao conectar ao MySQL:', err);
  else console.log('✅ Conexão com MySQL OK');
});

export default db;
