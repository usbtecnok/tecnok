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
