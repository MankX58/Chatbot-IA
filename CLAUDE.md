# CLAUDE.md

## Proyecto
- Nombre: `Chatbot-IA`
- Stack actual: React 19 + Vite + Tailwind + Auth0 + DeepSeek API.
- Objetivo inmediato: evolucionar el MVP actual hacia el cumplimiento de los requisitos funcionales del chatbot de soporte.

## Estado actual
- Login con Auth0 activo.
- Ruta `/home` protegida.
- Chat funcional contra DeepSeek por backend serverless en Vercel.
- Historial de tickets guardado por usuario.
- Calificacion y feedback implementados.
- Escalamiento basico en interfaz implementado.
- Confianza de respuesta implementada en primera version heuristica y visible en chat/tickets.
- Panel de soporte local con gestion de casos.
- Dashboard administrativo local con metricas y deteccion de no resueltos.
- Paneles de soporte y analitica visibles segun rol del usuario autenticado.

## Cambios recientes
- Se elimino el doble montaje de `Auth0Provider`.
- Se centralizo la configuracion de Auth0 en `config/auth0Config.js`.
- Se agrego `ProtectedRoute`.
- La API key de DeepSeek ya no vive en el navegador; ahora se lee solo en el backend con `process.env.DEEPSEEK_API_KEY`.
- Se agrego `services/confidenceService.js` para cubrir la primera iteracion de `RF-03`.
- Se extendio el ticket para guardar `lastConfidence` y la confianza por mensaje.
- Se agrego `src/services/ticketBoardService.js` para agregacion, prioridad, estados y metricas.
- Se agregaron `AgentPanel.jsx` y `AnalyticsPanel.jsx`.
- Se agregaron `api/chat.js` y `api/health.js` para correr DeepSeek del lado servidor con `DEEPSEEK_API_KEY`.
- `ConfigPanel.jsx` ya no solicita secretos del usuario y ahora valida el estado del backend.
- El frontend puede apuntar a un backend remoto con `VITE_API_BASE_URL` cuando se pruebe fuera de Vercel.
- Se agrego `src/utils/accessControl.js` para habilitar secciones por rol usando claims de Auth0 o listas de correos configurables.
- Se agregaron fallbacks para correos de prueba por rol en `src/utils/accessControl.js` (admin, agente, usuario).
- Se agrego el archivo `.env.local` configurando localmente las variables de Auth0 y los correos de prueba.
- La tanda actual quedo validada con `npm.cmd run build` y `npm.cmd run lint`.


## Siguientes pasos recomendados
1. Probar el flujo completo con dependencias instaladas y corregir cualquier regresion visual.
2. Implementar backend para tickets, estados reales y escalamientos.
3. Reemplazar la heuristica de confianza por retrieval real contra base de conocimiento.
4. Separar roles reales de usuario, agente y administrador.
5. Conectar metricas a datos persistentes y no solo a `localStorage`.

## Restricciones y notas
- No sobrescribir cambios del usuario sin revisar `git status`.
- Registrar cambios importantes tambien en `AI_LOG.md`.
- Si se toca autenticacion, revisar `src/main.jsx`, `src/App.jsx`, `config/auth0Config.js` y `AUTH0_SETUP.md`.
- Si se toca trazabilidad de tickets, revisar `src/hooks/useChatHistory.js`, `src/hooks/useSupportTickets.js` y `src/services/ticketBoardService.js`.
- Si se toca IA, revisar `services/deepseekService.js`, `api/chat.js`, `api/health.js` y la variable `DEEPSEEK_API_KEY` en Vercel.
- Si se toca autorizacion por rol, revisar `src/utils/accessControl.js`, `src/components/chat_response/Header.jsx`, `src/components/chat_response/Sidebar.jsx` y `VITE_AUTH0_ROLES_CLAIM`.
