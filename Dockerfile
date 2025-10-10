# Imagem base do Node
FROM node:22

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas os arquivos de dependências do backend primeiro
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install

# Volta para a raiz e copia o restante do projeto
WORKDIR /app
COPY . .

# Expõe a porta usada pelo Render
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "server/index.js"]
