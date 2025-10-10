import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import clientesRouter from '../routes/clientes.js';
import motoristasRouter from '../routes/motoristas.js';
import corridasRouter from '../routes/corridas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Servir páginas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
app.get('/motorista', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/motorista.html'));
});
app.get('/cliente', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/cliente.html'));
});
app.get('/corrida', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/corrida.html'));
});

// APIs
app.use('/api/clientes', clientesRouter);
app.use('/api/motoristas', motoristasRouter);
app.use('/api/corridas', corridasRouter);

app.listen(PORT, () => {
  console.log(\`Servidor Tecnok rodando na porta \${PORT}\`);
});
