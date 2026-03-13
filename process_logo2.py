from PIL import Image
import numpy as np

img_path = "img/logo-mc.png"
img = Image.open(img_path).convert("RGBA")
data = np.array(img)

r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
mask = (a > 10) & ~((r > 240) & (g > 240) & (b > 240))

rows = np.any(mask, axis=1)
cols = np.any(mask, axis=0)
ymin, ymax = np.where(rows)[0][[0, -1]]
xmin, xmax = np.where(cols)[0][[0, -1]]

row_sums = mask[ymin:ymax+1].sum(axis=1)
y_start = len(row_sums) // 3
y_end = 2 * len(row_sums) // 3
gap_y = y_start + np.argmin(row_sums[y_start:y_end])

mc_ymax = ymin + gap_y

margin = 15
crop_ymin = max(0, ymin - margin)
crop_ymax = min(data.shape[0], mc_ymax + margin//2)
crop_xmin = max(0, xmin - margin)
crop_xmax = min(data.shape[1], xmax + margin)

cropped = img.crop((crop_xmin, crop_ymin, crop_xmax, crop_ymax))

# Para mantener colores originales: 
# (el fondo blanco original de Gemini lo hacemos transparente)
c_data = np.array(cropped)
c_r, c_g, c_b, c_a = c_data[:,:,0], c_data[:,:,1], c_data[:,:,2], c_data[:,:,3]
bg_mask = (c_r > 230) & (c_g > 230) & (c_b > 230)
c_data[bg_mask, 3] = 0 # Hacer fondo transparente
Image.fromarray(c_data).save("img/logo-mc-cropped.png")

# Versión 100% blanca:
white_data = np.zeros_like(c_data)
white_data[~bg_mask & (c_a > 10)] = [255, 255, 255, 255]
Image.fromarray(white_data).save("img/logo-mc-white.png")
