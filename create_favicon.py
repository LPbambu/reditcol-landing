from PIL import Image
import numpy as np

img_path = "img/logo-mc.png"
img = Image.open(img_path).convert("RGBA")
data = np.array(img)

# Encontrar los límites nuevamente
r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
bg_mask_orig = (r > 230) & (g > 230) & (b > 230)
content_mask = (a > 10) & ~bg_mask_orig

rows = np.any(content_mask, axis=1)
cols = np.any(content_mask, axis=0)
ymin, ymax = np.where(rows)[0][[0, -1]]
xmin, xmax = np.where(cols)[0][[0, -1]]

row_sums = content_mask[ymin:ymax+1].sum(axis=1)
y_start = len(row_sums) // 3
y_end = 2 * len(row_sums) // 3
gap_y = y_start + np.argmin(row_sums[y_start:y_end])

mc_ymax = ymin + gap_y

# Recortar sin márgenes para centrar matemáticamente perfecto
crop_ymin = ymin
crop_ymax = mc_ymax
crop_xmin = xmin
crop_xmax = xmax

cropped = img.crop((crop_xmin, crop_ymin, crop_xmax, crop_ymax))
c_data = np.array(cropped)
c_r, c_g, c_b, c_a = c_data[:,:,0], c_data[:,:,1], c_data[:,:,2], c_data[:,:,3]
c_bg_mask = (c_r > 220) & (c_g > 220) & (c_b > 220)

# Crear imagen 100% blanca con la misma transparencia y forma original
white_data = np.zeros_like(c_data)
# Mantener el antialiasing usando el canal alfa
# Primero convertimos todos los píxeles a blanco
white_data[:,:,0], white_data[:,:,1], white_data[:,:,2] = 255, 255, 255

# Ajustamos la transparencia
alpha = c_a.copy()
# Los píxeles que eran del fondo blanco se vuelven 100% transparentes
alpha[c_bg_mask] = 0
white_data[:,:,3] = alpha

mc_white_img = Image.fromarray(white_data)

# ======= AQUI ESTA LA CLAVE =======
# Los navegadores estiran las imágenes si no son perfectmente cuadradas.
# El logo de MC es rectangular. Vamos a ponerlo en un lienzo cuadrado
width, height = mc_white_img.size
size = max(width, height)
# Agregamos 15% de padding extra al cuadrado para que el logo respire y no quede pegado al borde
padded_size = int(size * 1.3)

square_img = Image.new('RGBA', (padded_size, padded_size), (255, 255, 255, 0)) # Fondo transparente
offset = ((padded_size - width) // 2, (padded_size - height) // 2)

square_img.paste(mc_white_img, offset)

# Redimensionar al tamaño estándar más grande de los favicons con máxima calidad
square_img.thumbnail((256, 256), Image.Resampling.LANCZOS)
square_img.save("img/favicon-square.png")
print("Favicon cuadrado perfecto guardado!")
