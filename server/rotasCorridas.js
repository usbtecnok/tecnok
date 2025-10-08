import express from 'express';
import db from './db.js'; // conexão já existente com MariaDB
const router = express.Router();

// Rota para listar todas as corridas com preços fixos
router.get('/corridas-precos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT rota, preco FROM corridas_precos');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar corridas:', error);
    res.status(500).json({ error: 'Erro ao buscar corridas' });
  }
});

export default router;
