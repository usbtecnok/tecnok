import WebSocket from 'ws';
import chalk from 'chalk';

const ws = new WebSocket('ws://127.0.0.1:5000');

ws.on('open', () => {
  console.log(chalk.green('✅ Conectado ao WebSocket do servidor!'));
  ws.send('Olá servidor!');
});

ws.on('message', (message) => {
  try {
    const data = JSON.parse(message.toString());
    if(data.type === 'update') {
      console.log(chalk.blue(`\n📢 Atualização de rotas (${data.timestamp}):`));
      data.routes.forEach(route => {
        console.log(`  ${chalk.yellow(route.from)} → ${chalk.yellow(route.to)} : ${chalk.green(route.price)} reais`);
      });
    } else if(data.type === 'info') {
      console.log(chalk.cyan(`ℹ️  ${data.message}`));
    } else {
      console.log('📩 Mensagem desconhecida:', data);
    }
  } catch (err) {
    console.log('📩 Mensagem recebida (não JSON):', message.toString());
  }
});

ws.on('close', () => console.log(chalk.red('❌ Conexão WebSocket fechada.')));
ws.on('error', (err) => console.error(chalk.red('⚠️ Erro no WebSocket:'), err));
