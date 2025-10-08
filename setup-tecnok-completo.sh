#!/bin/bash
# Script completo para Tecnok (frontend + backend WebSocket + botão pânico)

# Criar pastas
mkdir -p ~/tecnok/frontend/css
mkdir -p ~/tecnok/frontend/js
mkdir -p ~/tecnok/server

# -------------------
# Frontend
# -------------------
cat > ~/tecnok/frontend/index.html << 'EHTML'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tecnok</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>
<div class="container">
  <img src="logo.png" alt="Logo Tecnok" class="logo">
  <h1>Bem-vindo ao Tecnok</h1>
  <div class="buttons">
    <button id="btn-passenger" class="btn green">Sou Passageiro</button>
    <button id="btn-driver" class="btn green">Sou Motorista</button>
    <button id="btn-panic" class="btn red">🚨 Botão de Pânico</button>
  </div>
  <div id="content"></div>
  <div id="alerts"></div>
</div>
<script type="module" src="js/index.js"></script>
</body>
</html>
EHTML

# CSS
cat > ~/tecnok/frontend/css/style.css << 'ECSS'
body {
  font-family: Arial, sans-serif;
  background: linear-gradient(to bottom, #e0eafc, #cfdef3);
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
}

.container {
  text-align: center;
  margin-top: 50px;
}

.logo {
  width: 150px;
  margin-bottom: 20px;
}

.buttons {
  margin: 20px 0;
}

.btn {
  padding: 15px 25px;
  margin: 5px;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  cursor: pointer;
}

.green { background-color: #28a745; }
.red { background-color: #dc3545; }

#content { margin-top: 30px; }
#alerts { margin-top: 20px; color: #dc3545; font-weight: bold; }
ECSS

# JS Frontend
cat > ~/tecnok/frontend/js/index.js << 'EJS'
// Conectar WebSocket
const ws = new WebSocket('ws://localhost:5000');

ws.onopen = () => console.log('✅ Conectado ao servidor WebSocket');

ws.onmessage = (msg) => {
  const data = JSON.parse(msg.data);
  if (data.type === 'panic') {
    const alertsDiv = document.getElementById('alerts');
    alertsDiv.innerHTML = `🚨 PANICO do ${data.user}`;
  }
};

// Botões
document.getElementById('btn-passenger').addEventListener('click', () => {
  document.getElementById('content').innerHTML = '<h2>Cadastro de Passageiro</h2><p>Formulário aqui...</p>';
});

document.getElementById('btn-driver').addEventListener('click', () => {
  document.getElementById('content').innerHTML = '<h2>Cadastro de Motorista</h2><p>Formulário aqui...</p>';
});

document.getElementById('btn-panic').addEventListener('click', () => {
  ws.send(JSON.stringify({ type: 'panic', user: 'Passageiro' }));
  alert('🚨 PANICO enviado ao servidor!');
});
EJS

# -------------------
# Backend WebSocket + Express
# -------------------
cat > ~/tecnok/server/index.ts << 'ETS'
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(process.cwd(), 'frontend')));

wss.on('connection', (ws) => {
  console.log('✅ Cliente WebSocket conectado!');
  ws.on('message', (msg) => {
    const data = JSON.parse(msg.toString());
    if (data.type === 'panic') {
      console.log('🚨 PANICO recebido de:', data.user);
      // Broadcast para todos os clientes
      wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) client.send(JSON.stringify({ type: 'panic', user: data.user }));
      });
    }
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`[express] Servindo frontend e WebSocket na porta ${PORT}`));
ETS

echo "✅ Tecnok frontend e backend criados com WebSocket e botão de pânico!"
echo "Rode: cd ~/tecnok && npm install express ws && npm run dev"

