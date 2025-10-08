import { WebSocketServer } from 'ws';
import mysql from 'mysql2/promise';

const wss = new WebSocketServer({ port: 5001 });

// Conexão com banco de dados
const db = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'usbtecnok',
  password: process.env.DB_PASSWORD || '@#*Z4939ia4',
  database: process.env.DB_NAME || 'usbtecnokcar'
});

wss.on('connection', ws => {
  console.log('✅ Cliente WebSocket conectado!');

  ws.on('message', async (msg) => {
    try {
      const data = JSON.parse(msg.toString());

      if (data.type === 'panic') {
        console.log('🚨 Alerta de pânico recebido:', data);

        const { lat, lng } = data.location;
        const timestamp = new Date(data.timestamp);

        // Salvar no banco
        await db.execute(
          'INSERT INTO panic_alerts (timestamp, latitude, longitude) VALUES (?, ?, ?)',
          [timestamp, lat, lng]
        );
        console.log('✅ Alerta de pânico salvo no banco!');
      }
    } catch (err) {
      console.error('Erro ao processar mensagem WebSocket:', err);
    }
  });
});

console.log('WebSocket de pânico rodando na porta 5001');
