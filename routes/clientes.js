import express from 'express';
import { pool } from '../server/db.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes ORDER BY id DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
});

router.post('/', async (req, res) => {
  const { nome, telefone } = req.body;
  try {
    const q = 'INSERT INTO clientes (nome, telefone) VALUES ($1, $2) RETURNING *';
    const result = await pool.query(q, [nome, telefone]);
    res.json({ message: 'Cliente cadastrado', cliente: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar cliente' });
  }
});

export default router;
