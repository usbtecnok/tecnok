#!/bin/bash
cd ~/tecnok
git lfs install
git lfs track "*.mp4"
git add .gitattributes
git add public/videos/tecnok_seguranca_praticidade.mp4
git add .
git commit -m "Adiciona vídeo USBTECNOK_ Segurança e Praticidade usando Git LFS"
git push origin main
