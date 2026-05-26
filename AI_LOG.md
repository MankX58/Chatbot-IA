# AI Log

Este archivo mantiene un registro de tareas importantes, cambios significativos, decisiones tecnicas y pendientes del proyecto.

## 2026-05-25
- **Cambios realizados:** Se unifico la integracion de Auth0 en un solo `Auth0Provider`, se protegio la ruta `/home` con `ProtectedRoute`, se movio la API key de DeepSeek de `localStorage` a `sessionStorage`, y se implemento un calculo inicial de confianza para las respuestas del chatbot con visualizacion en chat y tickets.
- **Cambios realizados:** Se agregaron un `Panel de soporte` y un `Dashboard administrativo` basados en los tickets almacenados localmente. Ahora el sistema puede listar casos escalados, priorizarlos, registrar respuestas de soporte, cambiar estados (`escalated`, `in_progress`, `resolved`, `closed`), mostrar respuestas del agente al usuario y calcular metricas operativas.
- **Archivos agregados:** `src/components/auth/ProtectedRoute.jsx`, `src/utils/browserStorage.js`, `services/confidenceService.js`, `src/services/ticketBoardService.js`, `src/hooks/useSupportTickets.js`, `src/components/chat_response/AgentPanel.jsx`, `src/components/chat_response/AnalyticsPanel.jsx`, `CLAUDE.md`.
- **Decisiones tecnicas:** 
  - Mantener el fallback de Auth0 actual en `config/auth0Config.js` para no romper el entorno mientras no exista `.env.local`.
  - Usar una heuristica local de confianza basada en coincidencia lexical con la base de conocimiento como primera version de `RF-03`.
  - Persistir tickets en `localStorage` y la API key solo en `sessionStorage` para reducir exposicion de secretos.
  - Resolver el flujo de agente y analitica en frontend sobre `localStorage` como paso intermedio antes de introducir backend.
- **Pendientes actuales:**
  - Validar el flujo completo en navegador cuando existan dependencias instaladas.
  - Implementar backend real para tickets y escalamientos.
  - Mejorar la confianza con retrieval real y no solo heuristica local.
  - Crear integracion institucional y control real de roles para separar usuario, agente y administrador.
