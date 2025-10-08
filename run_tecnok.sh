#!/bin/bash
PROJ=/home/aparecido/tecnok

echo "Iniciando backend na porta 5000..."
gnome-terminal -- bash -c "cd $PROJ/server && npx tsx index.ts; exec bash"

sleep 2

echo "Iniciando frontend na porta 8000..."
gnome-terminal -- bash -c "cd $PROJ/frontend && python3 -m http.server 8000; exec bash"

sleep 2

echo "Abrindo navegador na página principal..."
xdg-open http://localhost:8000/index.html

echo "Tecnok iniciado! Backend:5000 Frontend:8000"
