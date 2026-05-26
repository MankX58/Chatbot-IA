# AI Log

Este archivo mantiene un registro de tareas importantes, cambios significativos, decisiones tecnicas y pendientes del proyecto.

## 2026-05-26
- **Cambios realizados:** Se agrego soporte para `VITE_API_BASE_URL`, permitiendo que el frontend local consuma el backend serverless desplegado en Vercel cuando no se use el mismo origen.
- **Cambios realizados:** Se introdujo control de acceso por rol en la UI. Los paneles de soporte y metricas ahora se habilitan segun claims de Auth0 o listas de correos configuradas con `VITE_SUPPORT_AGENT_EMAILS` y `VITE_ADMIN_EMAILS`.
- **Cambios realizados:** Se agregaron correos fallbacks en `src/utils/accessControl.js` para agentes y administradores, facilitando pruebas de roles sin necesidad de configurar variables de entorno.
- **Cambios realizados:** Se creo el archivo `.env.local` configurando las variables de Auth0 y los correos de prueba funcionales para cada rol.
- **Validacion realizada:** `npm.cmd run build` y `npm.cmd run lint` ejecutados con resultado correcto tras migrar la capa serverless, el control de acceso y tras agregar los correos de prueba locales.
- **Decisiones tecnicas:**
  - Mantener `/api/chat` y `/api/health` como endpoints por defecto y permitir override solo mediante `VITE_API_BASE_URL`.
  - Habilitar CORS y peticiones `OPTIONS` en las funciones serverless para facilitar pruebas desde origenes distintos durante desarrollo.
  - Resolver la primera capa de autorizacion en frontend usando `VITE_AUTH0_ROLES_CLAIM` y listas de correos por entorno mientras no exista un backend de roles institucional.
  - Establecer fallbacks integrados de correos para `agente@ejemplo.com` y `admin@ejemplo.com` para garantizar funcionalidad fuera de la caja en pruebas locales.
- **Cambios realizados (RF-12):** Se implemento aprendizaje automatico. Se creo `src/services/learningService.js` que extrae conocimiento de tickets resueltos por agentes y de chats con rating >= 4 estrellas, y lo almacena en `localStorage` bajo la clave `learned_kb`.
- **Cambios realizados (RF-12):** Se modifico `services/deepseekService.js` para enviar `learnedEntries` al backend en cada peticion de chat.
- **Cambios realizados (RF-12):** Se modifico `api/chat.js` para recibir, validar (maximo 20 entradas) y pasar `learnedEntries` a `buildSystemPrompt`.
- **Cambios realizados (RF-12):** Se modifico `config/systemPrompt.js` para aceptar un parametro `learnedEntries` e inyectarlo en una seccion dinamica `CONOCIMIENTO APRENDIDO` del prompt del modelo.
- **Cambios realizados (RF-12):** Se modifico `AgentPanel.jsx` con un checkbox (marcado por defecto) que permite al agente guardar su respuesta como conocimiento del chatbot al registrar una respuesta de soporte.
- **Archivos agregados:** `src/services/learningService.js`.
- **Archivos modificados:** `src/utils/browserStorage.js`, `services/deepseekService.js`, `api/chat.js`, `config/systemPrompt.js`, `src/components/chat_response/AgentPanel.jsx`.
- **Validacion realizada:** `npm.cmd run build` y `npm.cmd run lint` ejecutados con resultado correcto tras implementar RF-12.
- **Decisiones tecnicas (RF-12):**
  - Usar `localStorage` como almacen intermedio del conocimiento aprendido hasta que se implemente la base de datos real.
  - Limitar a 20 entradas aprendidas por peticion para no exceder el contexto del modelo DeepSeek.
  - Priorizar las respuestas de agentes sobre las calificaciones positivas como fuente de conocimiento (mayor precision).
  - El checkbox en AgentPanel esta marcado por defecto para fomentar el aprendizaje continuo del sistema.
- **Pendientes actuales (Requisitos Funcionales faltantes o por optimizar):**
  - **Falta persistencia en Backend (RF-04, RF-05, RF-07, RF-13, RF-14):** Migrar local storage a una BD real para que Agentes y Admins vean la data persistente.
  - **Mejorar cálculo de confianza / RAG (RF-02, RF-03):** Cambiar la heurística local por una base de datos vectorial/búsqueda semántica.
  - ~~**Aprendizaje automático (RF-12):**~~ ✅ Implementado.
  - **Falta control de roles en Auth0 real (RF-09):** Cambiar el sistema manual por inyección de claims via Auth0 Actions.

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
