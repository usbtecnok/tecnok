import express from 'express';
import { pool } from '../server/db.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM corridas ORDER BY id DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar corridas' });
  }
});

router.post('/', async (req, res) => {
  const { cliente_id, motorista_id, origem, destino, status } = req.body;
  try {
    const q = 'INSERT INTO corridas (cliente_id, motorista_id, origem, destino, status) VALUES ($1,$2,$3,$4,$5) RETURNING *';
    const result = await pool.query(q, [cliente_id, motorista_id, origem, destino, status || 'pendente']);
    res.json({ message: 'Corrida registrada', corrida: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar corrida' });
  }
});

export default router;
