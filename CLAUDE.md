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

## Cambios recientes
- Se elimino el doble montaje de `Auth0Provider`.
- Se centralizo la configuracion de Auth0 en `config/auth0Config.js`.
- Se agrego `ProtectedRoute`.
- La API key de DeepSeek ahora vive en `sessionStorage`.
- Se agrego `services/confidenceService.js` para cubrir la primera iteracion de `RF-03`.
- Se extendio el ticket para guardar `lastConfidence` y la confianza por mensaje.

## Siguientes pasos recomendados
1. Probar el flujo completo con dependencias instaladas y corregir cualquier regression visual.
2. Implementar backend para tickets, estados reales y escalamientos.
3. Reemplazar la heuristica de confianza por retrieval real contra base de conocimiento.
4. Crear panel de agente de soporte.
5. Crear dashboard administrativo y metricas.

## Restricciones y notas
- No sobrescribir cambios del usuario sin revisar `git status`.
- Registrar cambios importantes tambien en `AI_LOG.md`.
- Si se toca autenticacion, revisar `src/main.jsx`, `src/App.jsx`, `config/auth0Config.js` y `AUTH0_SETUP.md`.
- Si se toca trazabilidad de tickets, revisar `src/hooks/useChatHistory.js` y `src/components/chat_response/TicketsPanel.jsx`.
