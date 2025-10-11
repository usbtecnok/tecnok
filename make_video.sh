#!/usr/bin/env bash
set -euo pipefail

# ===== Configuração =====
PROJECT="${HOME}/tecnok"
FRONTEND="${PROJECT}/frontend"
ASSETS="${FRONTEND}/assets"
AUDIO="${FRONTEND}/USBTECNOK_Narracao.mp3"
OUT="${FRONTEND}/USBTECNOK_Seguranca_e_Praticidade.mp4"

# Arquivos de cena (ajuste os nomes aqui se precisar)
SC1="${ASSETS}/scene1_itanhanga.jpg"
SC2="${ASSETS}/scene2_alto_boa_vista.jpg"
SC3="${ASSETS}/scene3_furnas.jpg"
END="${ASSETS}/endcard.jpg"

# Duração aproximada por cena (somando ~14s)
D1=3.5
D2=3.5
D3=3.5
D4=3.5

# ===== Checagens =====
need() { command -v "$1" >/dev/null 2>&1 || { echo "❌ Faltando: $1"; exit 1; }; }

echo "📦 Checando dependências…"
need ffmpeg
need ffprobe

echo "📁 Checando arquivos…"
for f in "$AUDIO" "$SC1" "$SC2" "$SC3" "$END"; do
  [[ -f "$f" ]] || { echo "❌ Arquivo não encontrado: $f"; exit 1; }
done

mkdir -p "$ASSETS"

# ===== Gera lista de slides =====
SLIDES="${ASSETS}/slides.txt"
cat > "$SLIDES" <<SL
file '$(basename "$SC1")'
duration ${D1}
file '$(basename "$SC2")'
duration ${D2}
file '$(basename "$SC3")'
duration ${D3}
file '$(basename "$END")'
duration ${D4}
# repetir último frame para evitar corte na concatenação
file '$(basename "$END")'
SL

echo "📝 slides.txt criado em $SLIDES:"
cat "$SLIDES"

# ===== Renderiza o vídeo (1080x1920, sem música, só narração) =====
echo "🎬 Renderizando vídeo…"
cd "$ASSETS"

ffmpeg -y -r 1 -f concat -safe 0 -i "$SLIDES" \
  -i "$AUDIO" \
  -c:v libx264 -pix_fmt yuv420p -r 30 \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" \
  -c:a aac -b:a 192k -shortest "$OUT"

echo "✅ Vídeo gerado:"
echo "   $OUT"

# ===== Dica de commit =====
echo
echo "💡 Para publicar no Render (GitHub):"
echo "cd ${PROJECT} && git add frontend/USBTECNOK_Seguranca_e_Praticidade.mp4"
echo "git commit -m 'Vídeo institucional USBTECNOK (narração)'"
echo "git push origin main"
