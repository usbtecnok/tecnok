#!/bin/bash

# Navegar para a pasta do projeto
cd ~/tecnok || exit

# 1️⃣ Instalar dependências Node.js
echo "Instalando dependências..."
npm install

# 2️⃣ Instalar Chart.js para gráficos (opcional)
npm install chart.js

# 3️⃣ Criar arquivo .env se não existir
if [ ! -f .env ]; then
cat > .env << EOL
DB_HOST=localhost
DB_PORT=3306
DB_USER=usbtecnok
DB_PASSWORD=@#*Z4939ia4
DB_NAME=usbtecnokcar
SESSION_SECRET=minha_senha_segura
EOL
echo ".env criado."
fi

# 4️⃣ Copiar logo para a pasta pública
if [ -f ~/Downloads/logotecnok.png ]; then
    cp ~/Downloads/logotecnok.png ~/tecnok/public/logo.png
    echo "Logo copiada para ~/tecnok/public/logo.png"
fi

# 5️⃣ Rodar MariaDB (se não estiver rodando)
sudo systemctl start mariadb
echo "MariaDB iniciado."

# 6️⃣ Criar banco de dados se não existir
mysql -u usbtecnok -p@#*Z4939ia4 -e "CREATE DATABASE IF NOT EXISTS usbtecnokcar;"

# 7️⃣ Iniciar backend com TSX
echo "Iniciando backend..."
npm run dev

