import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL || '';

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});
