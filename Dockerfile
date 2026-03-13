# =======================================
# CREDITCOL — Dockerfile (simplificado)
# Base: nginx:alpine
# =======================================

FROM nginx:1.27-alpine

# Remover configuración nginx por defecto
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuración nginx personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos de la landing page
COPY index.html /usr/share/nginx/html/index.html
COPY gracias.html /usr/share/nginx/html/gracias.html
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY img/ /usr/share/nginx/html/img/

# Puerto de exposición
EXPOSE 80

# Iniciar nginx directamente
CMD ["nginx", "-g", "daemon off;"]
