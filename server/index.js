// server/index.js
// Arquivo principal do backend Tecnok para deploy no Render

// Carregando variáveis de ambiente
require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

// Conexão com PostgreSQL
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Middleware para JSON
app.use(express.json());

// Rotas de exemplo
app.get('/', (req, res) => {
  res.send('Servidor Tecnok rodando!');
});

// Exemplo de rota usando PostgreSQL
app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios LIMIT 10');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar usuários');
  }
});

// Start do servidor
app.listen(PORT, () => {
  console.log(`Servidor Tecnok rodando na porta ${PORT}`);
});
