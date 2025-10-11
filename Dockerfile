# Etapa 1: Base de Node
FROM node:22

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos do servidor
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install

# Volta e copia tudo (inclui frontend e assets)
WORKDIR /app
COPY . .

# Expõe a porta
EXPOSE 10000

# Comando de inicialização
CMD ["node", "server/index.js"]
