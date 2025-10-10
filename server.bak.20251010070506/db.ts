import pkg from 'pg';
const { Pool } = pkg;

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = Number(process.env.DB_PORT || 5432);

export const pool = new Pool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
});

export const connectDB = async () => {
  try {
    await pool.connect();
    console.log(`✅ PostgreSQL conectado em ${DB_HOST}:${DB_PORT} (${DB_NAME})`);
  } catch (err) {
    console.error("❌ Erro ao conectar ao PostgreSQL:", err);
    process.exit(1);
  }
};
