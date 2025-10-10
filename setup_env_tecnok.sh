#!/bin/bash
cd /home/aparecido/tecnok

# Cria o arquivo .env com suas variáveis
cat > .env <<EOL
DB_HOST=db.tecnok.com.br
DB_USER=root
DB_PASS=z4939ia4
DB_NAME=tecnok
DB_PORT=3306
EOL

echo ".env criado com sucesso."

# Adiciona ao Git
git add .env
git commit -m "Adicionar .env com variáveis de ambiente do banco"
git push origin main

echo "Commit e push realizados com sucesso."
echo "Pronto! Faça redeploy no Render para aplicar as variáveis."
