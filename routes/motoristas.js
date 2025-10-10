import express from 'express';
import { pool } from '../server/db.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM motoristas ORDER BY id DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar motoristas' });
  }
});

router.post('/', async (req, res) => {
  const { nome, veiculo, status } = req.body;
  try {
    const q = 'INSERT INTO motoristas (nome, veiculo, status) VALUES ($1, $2, $3) RETURNING *';
    const result = await pool.query(q, [nome, veiculo, status || 'disponível']);
    res.json({ message: 'Motorista cadastrado', motorista: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar motorista' });
  }
});

export default router;
