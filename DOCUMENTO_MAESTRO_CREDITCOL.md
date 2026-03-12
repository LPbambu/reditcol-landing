# DOCUMENTO MAESTRO DE ESPECIFICACIÓN

## Proyecto: Landing Page de Alta Conversión – Creditcol

## Sistema: Antigravity

## Versión: 2.1

---

# 1. Objetivo del proyecto

Desarrollar una landing page optimizada para alta conversión enfocada en la captación de leads interesados en créditos financieros ofrecidos por Creditcol.

El sistema debe permitir:

* captar clientes potenciales
* registrar leads automáticamente
* conectar con asesores vía WhatsApp
* almacenar información en base de datos
* optimizar campañas de publicidad digital

El proyecto está orientado inicialmente al mercado de Santa Marta, Colombia.

---

# 2. Público objetivo

Segmentos principales:

Pensionados
Empleados públicos
Empleados privados con ingresos estables
Personas reportadas en Datacrédito

Rango de edad:

30 a 70 años

Ubicación inicial:

Santa Marta, Colombia

---

# 3. Propuesta de valor

La landing debe comunicar claramente que Creditcol ofrece:

Créditos por libranza
Créditos de libre inversión
Créditos para personas reportadas
Montos de hasta $150.000.000
Aprobación rápida
Asesoría personalizada

---

# 4. Estructura general de la landing

La página será una landing de una sola página (single page).

Secciones principales:

Hero principal
Beneficios
Requisitos
Formulario de solicitud
Sección de confianza
Llamado a la acción final

---

# 5. Funcionalidades del sistema

La plataforma debe permitir:

captura de leads mediante formulario
registro automático de leads
almacenamiento en base de datos
integración con WhatsApp
registro de fuente de tráfico
visualización de leads

---

# 6. Base de datos

La base de datos será gestionada mediante Supabase utilizando PostgreSQL.

Tabla principal: leads

Campos:

id (uuid)
created_at (timestamp)
nombre (text)
telefono (text)
tipo_cliente (text)
ingreso_aproximado (numeric)
reportado_datacredito (boolean)
fuente (text)
estado (text)
observaciones (text)

Valores del campo estado:

nuevo
contactado
en_proceso
aprobado
rechazado

---

# 7. Arquitectura del sistema

Componentes del sistema:

Frontend:

Landing page desarrollada dentro del framework Antigravity.

Backend:

Endpoints para procesamiento de formularios y conexión con Supabase.

Base de datos:

PostgreSQL gestionado mediante Supabase.

Infraestructura:

Servidor VPS propio.

Orquestación:

Dokploy.

Control de versiones:

GitHub.

---

# 8. Integración con Supabase

Supabase será utilizado para:

almacenamiento de leads
API automática
gestión de base de datos
seguridad básica

Variables necesarias:

SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

---

# 9. Control de versiones

El código del proyecto será gestionado mediante GitHub.

Repositorio sugerido:

antigravity-creditcol-landing

Flujo de trabajo:

main → producción
dev → desarrollo
feature → nuevas funcionalidades

---

# 10. Infraestructura

El sistema será desplegado en un servidor VPS privado.

Requisitos mínimos del servidor:

2 CPU
4 GB RAM
20 GB SSD

Sistema operativo recomendado:

Ubuntu Server LTS

---

# 11. Despliegue

El despliegue será gestionado mediante Dokploy.

Flujo de despliegue:

Push a GitHub
↓
Dokploy detecta cambios
↓
Build del contenedor
↓
Despliegue automático en VPS

---

# 12. Variables de entorno

SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
APP_ENV
APP_URL
WHATSAPP_NUMBER
META_PIXEL_ID

---

# 13. Integración de marketing

La landing debe integrar Meta Pixel para rastrear:

visitas
envíos de formulario
conversiones

Esto permitirá optimizar campañas publicitarias.

---

# 14. Seguridad

Validación de formularios
protección contra spam
rate limiting
validación de números telefónicos
uso obligatorio de HTTPS

---

# 15. Escalabilidad futura

El sistema deberá permitir posteriormente:

panel administrativo completo
gestión de asesores
automatización de seguimiento
expansión a nuevas ciudades
integración con CRM financiero

---

# 16. Arquitectura de conversión de la landing

La landing debe diseñarse siguiendo una estructura optimizada para conversión en servicios financieros.

El orden de los bloques debe ser el siguiente:

---

## 16.1 Hero principal

Objetivo: comunicar inmediatamente la propuesta de valor.

Título principal:

Crédito rápido incluso si estás reportado

Subtítulo:

Especialistas en créditos por libranza y libre inversión.

Botones principales:

Solicitar crédito ahora
Hablar con asesor por WhatsApp

---

## 16.2 Bloque de segmentación

Título:

¿A qué grupo perteneces?

Opciones:

Soy pensionado
Soy empleado público
Soy empleado privado

Estas opciones deben dirigir al formulario de solicitud.

---

## 16.3 Bloque de tranquilidad

Texto sugerido:

En Creditcol te ayudamos incluso si:

Estás reportado en Datacrédito
Necesitas reunificar deudas
Necesitas dinero urgente

---

## 16.4 Bloque de beneficios

Mostrar máximo cinco beneficios.

Créditos hasta $150 millones
Proceso rápido
Asesoría personalizada
Aprobación según perfil
Especialistas en reportados

---

## 16.5 Bloque de prueba social

Elementos:

testimonios simples
número de clientes asesorados
años de experiencia

---

## 16.6 Bloque de formulario

Formulario simple con los siguientes campos:

Nombre
Teléfono
Tipo de cliente
¿Está reportado en Datacrédito?

Botón:

Solicitar crédito

---

## 16.7 Página de confirmación

Después de enviar el formulario el usuario debe ser redirigido a una página de confirmación.

Mensaje:

Solicitud recibida correctamente.

Para acelerar el proceso, habla ahora con un asesor.

Botón:

Hablar por WhatsApp

---

## 16.8 Botón flotante

Debe existir un botón flotante de WhatsApp visible durante toda la navegación.
