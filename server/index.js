import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Serve os arquivos do frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Página inicial
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Endpoint básico de teste
app.get("/api/status", (req, res) => {
  res.json({ status: "ok", message: "Servidor Tecnok ativo" });
});

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🚗 Servidor Tecnok rodando na porta ${PORT}`);
});
