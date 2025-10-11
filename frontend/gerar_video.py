from PIL import Image, ImageDraw, ImageFont
from moviepy.editor import ImageClip
import textwrap

# Texto e caminho completo da imagem
INTRO_TXT = "Bem-vindo à USBTECNOKCAR - Segurança e praticidade no transporte!"
INTRO_IMG = "/home/aparecido/tecnok/frontend/assets/logotecnok.png"

def mk_card(text, img_path):
    base_img = Image.open(img_path).convert("RGBA")

    # Coordenadas da caixa de texto
    box_coords = (50, base_img.height * 0.7, base_img.width - 50, base_img.height - 50)

    # Garante que largura e altura sejam positivas e inteiras
    width = abs(int(box_coords[2] - box_coords[0]))
    height = abs(int(box_coords[3] - box_coords[1]))
    width = max(width, 1)
    height = max(height, 1)

    # Cria caixa translúcida
    box = Image.new("RGBA", (width, height), (0, 0, 0, 120))
    base_img.paste(box, (int(box_coords[0]), int(box_coords[1])), box)

    # Desenha texto
    draw = ImageDraw.Draw(base_img)
    font = ImageFont.load_default()
    wrapped_text = textwrap.fill(text, width=40)
    text_x = int(box_coords[0] + 10)
    text_y = int(box_coords[1] + 10)
    draw.text((text_x, text_y), wrapped_text, fill="white", font=font)

    # Salva imagem e cria vídeo
    output_img_path = "frame_intro.png"
    base_img.save(output_img_path)
    print(f"Imagem salva: {output_img_path}")

    clip = ImageClip(output_img_path).set_duration(5)
    clip.write_videofile("intro_video.mp4", fps=24)

if __name__ == "__main__":
    mk_card(INTRO_TXT, INTRO_IMG)
