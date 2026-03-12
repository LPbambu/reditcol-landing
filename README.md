# Creditcol Landing Page

**Sistema:** Antigravity | **Versión:** 2.1

Landing page de alta conversión para captación de leads de crédito financiero.
Mercado objetivo: Santa Marta, Colombia.

---

## Tech Stack

- **Frontend:** HTML + CSS + JS vanilla (máxima velocidad)
- **Base de datos:** Supabase (PostgreSQL)
- **Tracking:** Meta Pixel (Facebook Ads)
- **Infraestructura:** nginx en Docker
- **Deploy:** Dokploy + VPS

---

## Estructura del proyecto

```
CreditCol-Pagina/
├── index.html              ← Landing principal (todas las secciones)
├── gracias.html            ← Página de confirmación post-formulario
├── css/
│   └── styles.css          ← Estilos completos
├── js/
│   ├── main.js             ← Lógica: Supabase, Pixel, formulario, animaciones
│   ├── config.template.js  ← Template de configuración (reemplazado por Docker)
│   └── config.js           ← [Generado en runtime - NO editar manualmente]
├── nginx.conf              ← Configuración nginx
├── Dockerfile              ← Build del contenedor
├── docker-compose.yml      ← Levantamiento local
├── entrypoint.sh           ← Script que inyecta .env en config.js
├── supabase-schema.sql     ← Schema para crear la tabla en Supabase
├── .env.example            ← Variables de entorno (copiar como .env)
└── .gitignore
```

---

## Setup inicial

### 1. Variables de entorno

```bash
cp .env.example .env
# Edita .env con tus valores reales
```

Variables requeridas:

| Variable | Descripción |
|---|---|
| `SUPABASE_URL` | URL de tu proyecto Supabase |
| `SUPABASE_ANON_KEY` | Clave anónima de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (para admin) |
| `WHATSAPP_NUMBER` | Número internacional sin + (ej: 573001234567) |
| `META_PIXEL_ID` | ID del Pixel de Meta/Facebook |
| `APP_ENV` | `production` o `development` |
| `APP_URL` | URL pública del sitio |

### 2. Crear tabla en Supabase

1. Ir al **SQL Editor** de tu proyecto Supabase
2. Ejecutar el contenido de `supabase-schema.sql`
3. Verificar que la tabla `leads` fue creada correctamente

### 3. Correr localmente

```bash
# Con Docker Compose
docker compose up --build

# Abrir en: http://localhost:3010
```

---

## Despliegue en VPS con Dokploy

1. Subir el código a GitHub (`antigravity-creditcol-landing`)
2. En Dokploy → **Nueva aplicación** → tipo **Dockerfile**
3. Conectar el repositorio de GitHub
4. Agregar todas las variables de entorno del `.env.example`
5. Configurar el dominio y SSL (Let's Encrypt)
6. Trigger deploy

El flujo automático es:
```
Push a GitHub → Dokploy detecta cambios → Build → Deploy automático
```

---

## Secciones de la landing

| # | Sección | Objetivo |
|---|---|---|
| 1 | **Hero principal** | Comunicar propuesta de valor inmediata |
| 2 | **Bloque de segmentación** | Identificación del perfil del usuario |
| 3 | **Bloque de tranquilidad** | Reducir objeciones ("incluso si estás reportado") |
| 4 | **Bloque de beneficios** | 5 beneficios clave con íconos |
| 5 | **Prueba social** | Estadísticas + 3 testimonios reales |
| 6 | **Formulario** | Captura de leads → Supabase |
| 7 | **Página de gracias** | Confirmación + CTA WhatsApp |
| ∞ | **Botón flotante WA** | Siempre visible durante la navegación |

---

## Campos del formulario → tabla `leads`

| Campo | Tipo | Notas |
|---|---|---|
| `nombre` | text | Requerido |
| `telefono` | text | Requerido, validado (10 dígitos) |
| `tipo_cliente` | text | pensionado / empleado_publico / empleado_privado |
| `reportado_datacredito` | boolean | Radio: sí/no |
| `fuente` | text | Capturado automáticamente desde UTM params |
| `estado` | text | Siempre inicia como `nuevo` |

---

## Meta Pixel — Eventos rastreados

| Evento | Cuándo se dispara |
|---|---|
| `PageView` | Al cargar cualquier página |
| `Lead` | Al enviar el formulario exitosamente |
| `CompleteRegistration` | Al cargar la página de gracias |

---

## Seguridad

- RLS habilitado en Supabase (anon solo puede INSERT)
- Validación de formulario en cliente
- HTTPS obligatorio en producción
- `.env` nunca en el repositorio (`.gitignore`)
- Headers de seguridad en nginx

---

*Développé par Sistema Antigravity — 2025*
