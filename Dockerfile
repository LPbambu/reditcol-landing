# =======================================
# CREDITCOL — Dockerfile
# Sistema: Antigravity | v2.1
# Base: nginx:alpine (ultra lightweight)
# =======================================

FROM nginx:1.27-alpine

# Instalar gettext para envsubst
RUN apk add --no-cache gettext

# Remover configuración nginx por defecto
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuración nginx personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos de la landing page
COPY index.html /usr/share/nginx/html/index.html
COPY gracias.html /usr/share/nginx/html/gracias.html
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/

# Copiar y configurar entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Puerto de exposición
EXPOSE 80

# Health check desactivado (Traefik gestiona la disponibilidad)
HEALTHCHECK NONE

# Punto de entrada
ENTRYPOINT ["/entrypoint.sh"]
