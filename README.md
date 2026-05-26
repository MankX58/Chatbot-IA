# 🤖 Chatbot IA - Módulo Rojo

Sistema inteligente de soporte tecnológico asistido por inteligencia artificial, desarrollado como parte del reto académico de la Universidad de Medellín.

## 🚀 Descripción

Este proyecto implementa un chatbot con capacidades de procesamiento de lenguaje natural (PLN), enfocado en brindar soporte automatizado a estudiantes y personal institucional en temas tecnológicos.

Forma parte del **Módulo Rojo**, cuyo objetivo es automatizar la atención de solicitudes relacionadas con servicios tecnológicos institucionales.

> Este módulo responde a la necesidad de mejorar la eficiencia en la gestión académica mediante el uso de inteligencia artificial. :contentReference[oaicite:0]{index=0}

---

## 🎯 Objetivo

Desarrollar un sistema de chatbot inteligente que:

- Atienda solicitudes 24/7
- Resuelva problemas comunes automáticamente
- Escale a agentes humanos cuando sea necesario
- Aprenda continuamente mediante retroalimentación

---

## 🧠 Funcionalidades principales

- 💬 Chatbot con IA (PLN)
- 🔍 Búsqueda de soluciones previas (base de conocimiento)
- ⚙️ Soporte a servicios como:
  - Correo institucional
  - LMS
  - Conectividad
  - Software académico
- 🔄 Escalamiento automático a soporte humano
- ⭐ Sistema de feedback para mejorar respuestas

---

## 🏗️ Tecnologías utilizadas

### Frontend
- React
- Vite
- TailwindCSS

### Backend (opcional / en desarrollo)
- Node.js / Express
- API de IA (OpenAI, etc.)

### Otros
- Git & GitHub
- REST APIs

---

## 🧩 Arquitectura

El sistema sigue una arquitectura modular, permitiendo su integración con otros módulos del sistema institucional:

- Módulo Rojo (Chatbot IA)
- Módulo Azul (Seguimiento estudiantil)
- Módulo Verde (Líneas de énfasis)
- Módulo Púrpura (Monitorías)

---

## 📦 Instalación

```bash
# Clonar repositorio
git clone https://github.com/MankX58/Chatbot-IA.git

# Entrar al proyecto
cd Chatbot-IA

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

## 🔐 Variables de entorno

Frontend (`.env.local`):

```bash
VITE_AUTH0_DOMAIN=tu-dominio.auth0.com
VITE_AUTH0_CLIENT_ID=tu-client-id
VITE_AUTH0_AUDIENCE=
VITE_API_BASE_URL=https://tu-app.vercel.app
VITE_AUTH0_ROLES_CLAIM=https://udemedellin.edu.co/roles
VITE_SUPPORT_AGENT_EMAILS=agente1@correo.com,agente2@correo.com
VITE_ADMIN_EMAILS=admin1@correo.com
```

Backend en Vercel:

```bash
DEEPSEEK_API_KEY=tu_api_key
```

Notas:

- `DEEPSEEK_API_KEY` solo debe vivir en Vercel y se consume desde `/api/chat`.
- `VITE_API_BASE_URL` es opcional. Sirve para que un frontend local apunte al deployment de Vercel.
- Si usas el mismo dominio en Vercel, el frontend consume `/api/chat` y `/api/health` sin configuracion adicional.
