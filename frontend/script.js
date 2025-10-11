document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#form-corrida");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const dados = {
        origem: document.querySelector("#origem").value,
        destino: document.querySelector("#destino").value,
        telefone: document.querySelector("#telefone").value,
      };

      try {
        const resposta = await fetch("https://usbtecnokcar-backend-1.onrender.com/api/ride", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados),
        });

        if (!resposta.ok) throw new Error("Erro no servidor");

        const resultado = await resposta.json();
        alert("Corrida solicitada com sucesso!\n" + JSON.stringify(resultado));
      } catch (erro) {
        console.error("Erro:", erro);
        alert("Falha ao enviar a corrida. Tente novamente.");
      }
    });
  }
});
