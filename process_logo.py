from PIL import Image
import numpy as np

# Cargar la imagen
img_path = "img/logo-mc.png"
img = Image.open(img_path).convert("RGBA")
data = np.array(img)

# Encontrar píxeles que no sean completamente blancos y 100% transparentes
# Asumimos que el fondo es blanco o transparente
r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
mask = (a > 10) & ~((r > 240) & (g > 240) & (b > 240))

# Encontrar los límites y de los píxeles con contenido
rows = np.any(mask, axis=1)
cols = np.any(mask, axis=0)
ymin, ymax = np.where(rows)[0][[0, -1]]
xmin, xmax = np.where(cols)[0][[0, -1]]

# Para separar MC de CREDITCOL, buscamos un espacio vacío horizontal en el medio de la imagen
# Sumamos los píxeles de contenido por fila
row_sums = mask[ymin:ymax+1].sum(axis=1)

# Encontramos la fila con menos contenido (el espacio entre MC y CREDITCOL)
# Buscamos en el tercio central
y_start = len(row_sums) // 3
y_end = 2 * len(row_sums) // 3
gap_y = y_start + np.argmin(row_sums[y_start:y_end])

# El logo de MC es desde el inicio hasta el corte (gap_y)
mc_ymax = ymin + gap_y

# Recortar la imagen (agregamos un pequeño margen)
margin = 20
crop_ymin = max(0, ymin - margin)
crop_ymax = min(data.shape[0], mc_ymax + margin//2)
crop_xmin = max(0, xmin - margin)
crop_xmax = min(data.shape[1], xmax + margin)

cropped = img.crop((crop_xmin, crop_ymin, crop_xmax, crop_ymax))

# Convertir todo el contenido (lo que no sea fondo) a blanco
c_data = np.array(cropped)
c_r, c_g, c_b, c_a = c_data[:,:,0], c_data[:,:,1], c_data[:,:,2], c_data[:,:,3]
c_mask = (c_a > 10) & ~((c_r > 240) & (c_g > 240) & (c_b > 240))

# Crear nueva imagen para el resultado: fondo transparente
result_data = np.zeros_like(c_data)
# Hacer blancos los píxeles de la máscara
result_data[c_mask] = [255, 255, 255, 255]

result_img = Image.fromarray(result_data)
result_img.save("img/logo-mc-white.png")

print("Logo procesado y guardado como img/logo-mc-white.png")
