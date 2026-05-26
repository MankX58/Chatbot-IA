# CLAUDE.md

## Proyecto
- Nombre: `Chatbot-IA`
- Stack actual: React 19 + Vite + Tailwind + Auth0 + DeepSeek API.
- Objetivo inmediato: evolucionar el MVP actual hacia el cumplimiento de los requisitos funcionales del chatbot de soporte.

## Estado actual
- Login con Auth0 activo.
- Ruta `/home` protegida.
- Chat funcional contra DeepSeek.
- Historial de tickets guardado por usuario.
- Calificacion y feedback implementados.
- Escalamiento basico en interfaz implementado.
- Confianza de respuesta implementada en primera version heuristica y visible en chat/tickets.
- Panel de soporte local con gestion de casos.
- Dashboard administrativo local con metricas y deteccion de no resueltos.

## Cambios recientes
- Se elimino el doble montaje de `Auth0Provider`.
- Se centralizo la configuracion de Auth0 en `config/auth0Config.js`.
- Se agrego `ProtectedRoute`.
- La API key de DeepSeek ahora vive en `sessionStorage`.
- Se agrego `services/confidenceService.js` para cubrir la primera iteracion de `RF-03`.
- Se extendio el ticket para guardar `lastConfidence` y la confianza por mensaje.
- Se agrego `src/services/ticketBoardService.js` para agregacion, prioridad, estados y metricas.
- Se agregaron `AgentPanel.jsx` y `AnalyticsPanel.jsx`.

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
