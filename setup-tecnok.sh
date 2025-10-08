#!/bin/bash
# Script para criar frontend completo do Tecnok

# Cria pastas
mkdir -p ~/tecnok/frontend/css
mkdir -p ~/tecnok/frontend/js

# HTML principal
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
    <button id="btn-install" class="btn blue">Instalar Tecnok</button>
  </div>

  <div id="content"></div>
</div>

<script src="js/index.js" type="module"></script>
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
.blue { background-color: #007bff; }

#content {
  margin-top: 30px;
}
ECSS

# JS principal
cat > ~/tecnok/frontend/js/index.js << 'EJS'
// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registrado:', reg))
      .catch(err => console.log('Falha SW:', err));
  });
}

// PWA Install Prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('Banner PWA não mostrado ainda');
});

document.getElementById('btn-install').addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('Resposta do usuário:', outcome);
    deferredPrompt = null;
  }
});

// Botões
document.getElementById('btn-passenger').addEventListener('click', () => {
  document.getElementById('content').innerHTML = '<h2>Cadastro de Passageiro</h2><p>Formulário aqui...</p>';
});

document.getElementById('btn-driver').addEventListener('click', () => {
  document.getElementById('content').innerHTML = '<h2>Cadastro de Motorista</h2><p>Formulário aqui...</p>';
});

document.getElementById('btn-panic').addEventListener('click', () => {
  alert('🚨 PANICO acionado!');
});
EJS

# Service Worker
cat > ~/tecnok/frontend/sw.js << 'ESW'
const CACHE_NAME = 'tecnok-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/index.js',
  '/logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
ESW

echo "Frontend do Tecnok criado com sucesso em ~/tecnok/frontend!"
