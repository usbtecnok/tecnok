// URL do backend Flask no Render
const API_URL = window.location.hostname.includes("localhost")
  ? "http://localhost:3000" // quando rodar localmente
  : "https://usbtecnokcar-backend.onrender.com"; // quando estiver online

// Exemplo: busca de motoristas
async function carregarMotoristas() {
  try {
    const resposta = await fetch(`${API_URL}/api/motoristas`);
    if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);
    const dados = await resposta.json();
    console.log("Motoristas:", dados);
  } catch (erro) {
    console.error("Erro ao conectar ao backend:", erro);
  }
}

window.addEventListener("load", carregarMotoristas);
