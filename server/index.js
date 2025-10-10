import http from 'http';

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Tecnok está rodando!\n');
});

server.listen(PORT, () => {
  console.log(`Servidor Tecnok rodando na porta ${PORT}`);
});
