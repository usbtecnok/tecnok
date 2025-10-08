let currentUserId = null; // Para simular login temporário

function showPassengerForm() { hideAll(); document.getElementById('passenger-form').classList.remove('hidden'); }
function showDriverForm() { hideAll(); document.getElementById('driver-form').classList.remove('hidden'); }
function showWelcome() { hideAll(); document.getElementById('welcome').classList.remove('hidden'); }
function hideAll() { document.querySelectorAll('main section').forEach(s => s.classList.add('hidden')); }

async function registerPassenger(e) {
  e.preventDefault();
  const form = e.target;
  const res = await fetch('/api/register-passenger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome: form[0].value, email: form[1].value, senha: form[2].value })
  });
  const data = await res.json();
  if (data.success) {
    alert("Passageiro cadastrado!");
    currentUserId = 1; // Simulação
    showRideForm();
  } else alert(data.error);
}

async function registerDriver(e) {
  e.preventDefault();
  const form = e.target;
  const res = await fetch('/api/register-driver', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome: form[0].value, email: form[1].value, senha: form[2].value, placa: form[3].value })
  });
  const data = await res.json();
  if (data.success) alert("Motorista cadastrado!");
  else alert(data.error);
  showWelcome();
}

function showRideForm() { hideAll(); document.getElementById('ride-form').classList.remove('hidden'); }

async function requestRide(e) {
  e.preventDefault();
  const form = e.target;
  const res = await fetch('/api/request-ride', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origem: form[0].value, destino: form[1].value, usuario_id: currentUserId })
  });
  const data = await res.json();
  if (data.success) alert("Corrida solicitada!");
  else alert(data.error);
}

async function triggerPanic() {
  if (!currentUserId) { alert("Faça login primeiro!"); return; }
  const res = await fetch('/api/panic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id: currentUserId })
  });
  const data = await res.json();
  if (data.success) alert("🚨 Botão de Pânico acionado!");
  else alert(data.error);
}

async function buyCredits(e) {
  e.preventDefault();
  const form = e.target;
  const res = await fetch('/api/buy-credits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id: currentUserId, quantidade: parseInt(form[0].value) })
  });
  const data = await res.json();
  if (data.success) alert("Créditos comprados!");
  else alert(data.error);
}

function acceptTerms() { alert("Termos aceitos!"); showWelcome(); }
