import WebSocket from 'ws';

// Conecta ao servidor WebSocket
const ws = new WebSocket('ws://localhost:5000');

ws.on('open', () => {
    console.log('✅ Conectado ao WebSocket do servidor!');
    // Envia uma mensagem de teste
    ws.send('Olá servidor!');
});

ws.on('message', (message) => {
    console.log('📩 Mensagem recebida do servidor:', message.toString());
});

ws.on('close', () => {
    console.log('❌ Conexão WebSocket fechada.');
});

ws.on('error', (err) => {
    console.error('⚠️ Erro no WebSocket:', err);
});
