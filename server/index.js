import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Páginas principais
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../frontend/index.html")));
app.get("/mapa", (req, res) => res.sendFile(path.join(__dirname, "../frontend/mapa.html")));
app.get("/driver", (req, res) => res.sendFile(path.join(__dirname, "../frontend/driver.html")));
app.get("/panic", (req, res) => res.sendFile(path.join(__dirname, "../frontend/panic-button-logo.html")));
app.get("/termo", (req, res) => res.sendFile(path.join(__dirname, "../frontend/termo_adesao_motorista.html")));

// API de teste
app.get("/api/status", (req, res) => {
  res.json({ status: "ok", message: "Servidor Tecnok ativo e integrando frontend completo" });
});

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🚗 Servidor Tecnok rodando na porta ${PORT}`);
});
