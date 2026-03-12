"""
Script para quitar el fondo blanco del logo CreditCol
y guardarlo como PNG con fondo transparente.
"""
from PIL import Image
import sys

# Ruta del logo original (el que pasó el usuario)
INPUT = r"c:\Users\Bambu\Downloads\Gemini_Generated_Image_6hk64x6hk64x6hk6 (2).png"
OUTPUT = r"c:\Users\Bambu\Downloads\CreditCol-Pagina\img\logo-creditcol.png"

def remove_white_background(input_path, output_path, threshold=240):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()

    new_data = []
    for r, g, b, a in data:
        # Si el píxel es casi blanco → transparente
        if r >= threshold and g >= threshold and b >= threshold:
            new_data.append((r, g, b, 0))   # alpha = 0 (transparente)
        else:
            new_data.append((r, g, b, a))   # mantener tal cual

    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"✅ Logo guardado con fondo transparente en:\n   {output_path}")

remove_white_background(INPUT, OUTPUT)
