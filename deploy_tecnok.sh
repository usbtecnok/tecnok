#!/bin/bash
set -e

# ==============================
# 🚗 DEPLOY TECNOK — BY GPT-5
# ==============================

# 1️⃣ Entrar na pasta do projeto
cd ~/tecnok

# 2️⃣ Inicializar o repositório Git (caso ainda não tenha)
git init
git branch -M main

# 3️⃣ Adicionar todos os arquivos
git add .

# 4️⃣ Fazer commit inicial
git commit -m "🚀 Deploy inicial do projeto Tecnok"

# 5️⃣ Remover qualquer remoto antigo (se houver)
git remote remove origin 2>/dev/null || true

# 6️⃣ Adicionar o novo repositório remoto do Render
# ⚠️ Substitua o link abaixo assim que criarmos o app no Render!
git remote add origin https://github.com/aparecido/tecnok.git

# 7️⃣ Empurrar o código para o GitHub (Render vai puxar de lá)
git push -u origin main -f

# 8️⃣ Mensagem final
echo "✅ Projeto TECNOK enviado com sucesso para o repositório remoto!"
echo "👉 Agora entre em https://render.com, crie um novo Web Service e conecte ao repositório tecnok."
echo "Selecione o ambiente Node.js e a pasta /client ou /backend conforme o tipo do app."
