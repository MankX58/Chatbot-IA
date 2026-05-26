# AI Log

Este archivo mantiene un registro de tareas importantes, cambios significativos, decisiones tecnicas y pendientes del proyecto.

## 2026-05-26
- **Cambios realizados:** Se agrego soporte para `VITE_API_BASE_URL`, permitiendo que el frontend local consuma el backend serverless desplegado en Vercel cuando no se use el mismo origen.
- **Cambios realizados:** Se introdujo control de acceso por rol en la UI. Los paneles de soporte y metricas ahora se habilitan segun claims de Auth0 o listas de correos configuradas con `VITE_SUPPORT_AGENT_EMAILS` y `VITE_ADMIN_EMAILS`.
- **Validacion realizada:** `npm.cmd run build` y `npm.cmd run lint` ejecutados con resultado correcto despues de migrar la capa serverless y el control de acceso.
- **Decisiones tecnicas:**
  - Mantener `/api/chat` y `/api/health` como endpoints por defecto y permitir override solo mediante `VITE_API_BASE_URL`.
  - Habilitar CORS y peticiones `OPTIONS` en las funciones serverless para facilitar pruebas desde origenes distintos durante desarrollo.
  - Resolver la primera capa de autorizacion en frontend usando `VITE_AUTH0_ROLES_CLAIM` y listas de correos por entorno mientras no exista un backend de roles institucional.

## 2026-05-25
- **Cambios realizados:** Se unifico la integracion de Auth0 en un solo `Auth0Provider`, se protegio la ruta `/home` con `ProtectedRoute`, se movio la API key de DeepSeek de `localStorage` a `sessionStorage`, y se implemento un calculo inicial de confianza para las respuestas del chatbot con visualizacion en chat y tickets.
- **Cambios realizados:** Se agregaron un `Panel de soporte` y un `Dashboard administrativo` basados en los tickets almacenados localmente. Ahora el sistema puede listar casos escalados, priorizarlos, registrar respuestas de soporte, cambiar estados (`escalated`, `in_progress`, `resolved`, `closed`), mostrar respuestas del agente al usuario y calcular metricas operativas.
- **Cambios realizados:** Se migro la integracion de DeepSeek al backend para Vercel. El frontend ahora consume `/api/chat`, se agrego `/api/health` para validar la configuracion serverless y la seccion de configuracion se convirtio en un panel de estado para `DEEPSEEK_API_KEY`.
- **Archivos agregados:** `src/components/auth/ProtectedRoute.jsx`, `src/utils/browserStorage.js`, `services/confidenceService.js`, `src/services/ticketBoardService.js`, `src/hooks/useSupportTickets.js`, `src/components/chat_response/AgentPanel.jsx`, `src/components/chat_response/AnalyticsPanel.jsx`, `CLAUDE.md`.
- **Decisiones tecnicas:** 
  - Mantener el fallback de Auth0 actual en `config/auth0Config.js` para no romper el entorno mientras no exista `.env.local`.
  - Usar una heuristica local de confianza basada en coincidencia lexical con la base de conocimiento como primera version de `RF-03`.
  - Persistir tickets en `localStorage` como fase intermedia, pero sacar completamente la API key del navegador y leer `process.env.DEEPSEEK_API_KEY` solo en funciones de Vercel.
  - Resolver el flujo de agente y analitica en frontend sobre `localStorage` como paso intermedio antes de introducir backend.
- **Pendientes actuales:**
  - Validar el flujo completo en navegador cuando existan dependencias instaladas.
  - Implementar backend real para tickets y escalamientos.
  - Mejorar la confianza con retrieval real y no solo heuristica local.
  - Crear integracion institucional y control real de roles para separar usuario, agente y administrador.
