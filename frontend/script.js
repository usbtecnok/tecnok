const socket = io();

socket.on('panic', (data) => {
    alert(`🚨 PANICO do ${data.tipo} acionado pelo usuário ${data.userId}!`);
});

function solicitarCorrida() {
    alert('✅ Corrida solicitada!');
}

function acaoPanico() {
    const userId = prompt('Seu ID de usuário para alerta de pânico:');
    socket.emit('panic', { userId, tipo: 'PANICO' });
}
