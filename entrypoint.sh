#!/bin/sh
# ============================================================
# CREDITCOL — Docker entrypoint
# Inyecta variables de entorno en config.js desde el template
# ============================================================

set -e

CONFIG_TEMPLATE="/usr/share/nginx/html/js/config.template.js"
CONFIG_OUTPUT="/usr/share/nginx/html/js/config.js"

echo "[CreditCol] Generando config.js desde variables de entorno..."

# Verificar que exista el template
if [ ! -f "$CONFIG_TEMPLATE" ]; then
  echo "[CreditCol] ERROR: config.template.js no encontrado."
  exit 1
fi

# Sustituir variables de entorno en el template → config.js
envsubst '${SUPABASE_URL} ${SUPABASE_ANON_KEY} ${WHATSAPP_NUMBER} ${META_PIXEL_ID} ${APP_ENV}' \
  < "$CONFIG_TEMPLATE" \
  > "$CONFIG_OUTPUT"

echo "[CreditCol] config.js generado correctamente."
echo "[CreditCol] APP_ENV=${APP_ENV:-development}"
echo "[CreditCol] Iniciando nginx..."

# Iniciar nginx en primer plano
exec nginx -g "daemon off;"
