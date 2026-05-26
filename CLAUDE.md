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
- Aprendizaje automatico implementado (RF-12): el sistema aprende de respuestas de agentes y calificaciones positivas de usuarios.
- Base de conocimiento expandida: incluye todos los pregrados, posgrados (especializaciones, maestrías, doctorados), soporte tecnológico (correo institucional @soyudemedellin.edu.co, LMS Canvas, WiFi SoyUdeMedellín y Porterías), portal estudiantil (SIGAA), carné digital (App UdeMedellín), bienestar universitario (salud, psicología, deportes), Biblioteca Eduardo Fernández Botero, Centro de Desarrollo Empresarial (CDE) y opciones de pago/financiación (Bancolombia, Banco Caja Social, PSE, ICETEX).
- Panel de Configuracion eliminado del frontend para todos los roles.

## Cambios recientes
- Se actualizó la base de conocimiento en `config/knowledgeBase.js` con información hiper-precisa y verificada de la Universidad de Medellín: soporte de correo institucional (recuperación vía aka.ms/sspr), Canvas (canvas.udemedellin.edu.co), red WiFi SoyUdeMedellín (conexión sin dominio) y red WiFi Porterías, acceso al SIGAA con identificación y fecha de nacimiento, carné digital a través de la App UdeMedellín (soporte vía sop_appudemedellin@udemedellin.edu.co), citas de salud gratuitas en el Bloque 2 (psicología, medicina y odontología), Biblioteca Eduardo Fernández Botero (horarios y extensión 11416), Centro de Desarrollo Empresarial (Bloque 15-103) y convenios de pago de Tesorería (Bancolombia 87015 y Caja Social 15887315).
- Se elimino el Panel de Configuracion del frontend para todos los roles: se quito de `accessControl.js`, `Header.jsx`, `Sidebar.jsx`, `App.jsx` y se actualizo el texto descriptivo del Sidebar para usuarios.
- La tanda actual quedo validada con `npm.cmd run build` y `npm.cmd run lint`.

## Siguientes pasos recomendados (Pendientes de Implementación)
1. **Persistencia y Backend Real (Afecta RF-04, RF-05, RF-07, RF-13, RF-14):** Migrar todo el almacenamiento de tickets, estados y métricas que actualmente reside en `localStorage` hacia una base de datos central (MongoDB/PostgreSQL/Supabase). Esto es crítico para que el Agente y Administrador vean los datos de los usuarios.
2. **Retrieval-Augmented Generation (RAG) (Afecta RF-02 y RF-03):** Reemplazar la heurística léxica actual en `confidenceService.js` por una búsqueda vectorial real contra una base de conocimiento para calcular verdaderamente el nivel de confianza y mejorar las soluciones.
3. ~~**Aprendizaje Automático (RF-12):**~~ ✅ Implementado. El sistema aprende de respuestas de agentes y calificaciones positivas.
4. **Roles Institucionales en Producción (Afecta RF-09 y accesos):** Reemplazar las listas manuales locales (`.env.local`) por "Auth0 Actions" para que inyecten los roles reales institucionales en el token JWT.

## Restricciones y notas
- No sobrescribir cambios del usuario sin revisar `git status`.
- Registrar cambios importantes tambien en `AI_LOG.md`.
- Si se toca autenticacion, revisar `src/main.jsx`, `src/App.jsx`, `config/auth0Config.js` y `AUTH0_SETUP.md`.
- Si se toca trazabilidad de tickets, revisar `src/hooks/useChatHistory.js`, `src/hooks/useSupportTickets.js` y `src/services/ticketBoardService.js`.
- Si se toca IA, revisar `services/deepseekService.js`, `api/chat.js`, `api/health.js` y la variable `DEEPSEEK_API_KEY` en Vercel.
- Si se toca autorizacion por rol, revisar `src/utils/accessControl.js`, `src/components/chat_response/Header.jsx`, `src/components/chat_response/Sidebar.jsx` y `VITE_AUTH0_ROLES_CLAIM`.
- Si se toca aprendizaje automatico (RF-12), revisar `src/services/learningService.js`, `services/deepseekService.js`, `api/chat.js`, `config/systemPrompt.js` y `src/components/chat_response/AgentPanel.jsx`.
