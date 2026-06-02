# Documentación del Proyecto: Sistema de Soporte UdeM

Esta documentación está orientada a desarrolladores para comprender la arquitectura, el flujo de datos y el propósito de cada módulo dentro de la aplicación de soporte.

## Arquitectura General
El proyecto es una aplicación web del lado del cliente construida con React (empaquetado por Vite). Está integrado con un backend (en el directorio `api/`) que expone los endpoints para interactuar con una base de datos PostgreSQL. La autenticación se maneja a través de Auth0, permitiendo controlar accesos basados en los roles (Estudiante, Agente de Soporte, Administrador).

## Comunicación con la Base de Datos y Flujo de Datos

### Endpoint Principal: `/api/tickets`
Toda la persistencia de casos de soporte (tickets) pasa por este endpoint. 

- **Creación y Actualización (`POST /api/tickets`)**:
  - **¿Qué envía el Frontend?** El cliente envía un objeto JSON con la estructura completa del ticket: `id`, `ownerId`, `ownerName`, `ownerEmail`, `status`, `rating`, `lastConfidence`, `breadcrumb`, `preview`, `messages` (array con el historial), `supportResponses`, `priority` y `escalationContext`.
  - **¿Cómo lo procesa el Backend?** El archivo `api/tickets.js` recibe la petición, conecta a PostgreSQL mediante `api/db.js` e inserta los datos. Si el `id` ya existe en la base de datos (ON CONFLICT), actualiza el registro. Utiliza comandos `COALESCE` para propiedades sensibles (como el `owner_name` o la `priority`) de forma que si el frontend envía un valor `null` temporal, no se sobreescriban los datos correctos existentes.
  - **¿Qué responde?** `{ success: true }` en caso de éxito.

- **Lectura de Datos (`GET /api/tickets`)**:
  - **¿Qué envía el Frontend?** Para los estudiantes, se envía `?ownerId=...` para traer solo sus tickets. Para los agentes, se consulta sin parámetros para obtener la totalidad.
  - **¿Cómo lo procesa el Backend?** Ejecuta un `SELECT * FROM tickets ORDER BY updated_at DESC`, mapeando las columnas de la base de datos (ej. `owner_name`) a llaves `camelCase` en JavaScript (`ownerName`).
  - **¿Qué responde?** Un array de objetos con todos los tickets y su historial.

## Estructura de Directorios y Responsabilidades

### 1. Directorio `api/` (Backend / Node.js)
- `db.js`: Inicializa el pool de conexiones (`pg`) a PostgreSQL y exporta la función `query` para ejecutar sentencias SQL.
- `tickets.js`: Controlador de la ruta `/api/tickets`. Se encarga de inicializar automáticamente las tablas (`ensureTableExists`) mediante `CREATE TABLE` y `ALTER TABLE`, así como de atender peticiones HTTP para gestionar tickets.

### 2. Directorio `src/hooks/` (Conexión Frontend-Backend)
- `useChatHistory.js`: Hook para la vista del **estudiante**. Contiene `saveTicket` y `updateSingleTicket`, que ejecutan las llamadas `fetch` con método POST para guardar en la BD el avance del chat del estudiante.
- `useSupportTickets.js`: Hook para el **Agente de Soporte**. Hace polling a `/api/tickets` para obtener tickets nuevos. Expone funciones para la gestión por parte del agente: `setTicketStatus`, `registerSupportResponse` y `setTicketPriority` (para modificar la prioridad de un caso a voluntad).

### 3. Directorio `src/services/` (Lógica de Negocio y Utilidades)
- `deepseekService.js`: Recibe el historial de conversación en curso y se comunica con el modelo LLM para obtener la respuesta de IA.
- `confidenceService.js`: Evalúa la calidad de la respuesta de la IA midiendo solapamientos de palabras (tokens) con `knowledgeBase.js`. Devuelve un nivel de confianza (Alta, Media, Baja). Si es baja, el sistema sugerirá al estudiante escalar a humano.
- `ticketBoardService.js`: Contiene funciones utilitarias que corren sobre el array de tickets (como `summarizeSupportMetrics` o `deriveTicketPriority`) para alimentar de datos estadísticos al AgentPanel y AnalyticsPanel.
- `learningService.js`: Módulo en desarrollo para registrar las respuestas de los agentes e inyectarlas dinámicamente a la Base de Conocimiento del bot.

### 4. Directorio `src/components/` (Componentes Visuales React)
- **`/login/` (`Main.jsx` y `Header.jsx`)**: Renderizan la interfaz pública inicial y manejan el inicio de sesión desencadenando el flujo de Auth0.
- **`/chat_response/`**: Componentes principales de la aplicación tras iniciar sesión.
  - `App.jsx`: Componente orquestador. Determina qué panel mostrar, controla la vista del menú (colapsable), e inyecta la lógica al enviar un mensaje (`handleSend`). Es el responsable de **asignar automáticamente la prioridad del ticket basándose en la última métrica de confianza de la IA** antes de escalarlo.
  - `ChatArea.jsx`: La vista conversacional para el estudiante. Renderiza las burbujas de texto, los selectores para dar *feedback* (calificar IA) y el modal de escalamiento (`EscalationModal`).
  - `AgentPanel.jsx`: Consola operativa para los Agentes de Soporte. Lista los tickets activos en una columna y el detalle de conversación en otra. Permite al agente leer el contexto, responder y **ajustar el nivel de prioridad** o el estado (Resuelto, Cerrado) del ticket de manera manual.
  - `TicketsPanel.jsx`: Vista en forma de listado simple para el usuario estudiante donde puede monitorear sus casos escalados o reanudarlos.
  - `Sidebar.jsx`, `Header.jsx`, `Footer.jsx`: Estructura base. El menú lateral es dinámico y ajusta su ancho mediante la propiedad `isSidebarCollapsed` guardada en `localStorage`.

### 5. Directorio `src/utils/`
- `accessControl.js`: Comprueba el token de sesión de Auth0 y determina qué roles tiene el usuario. Provee funciones como `isSectionAvailable` para garantizar que un estudiante no renderice el componente `AgentPanel` o `AnalyticsPanel`.

## Flujo de Implementación de Cambios (Para Desarrolladores Nuevos)
- **Para añadir campos a los Tickets:**
  1. Ir a `api/tickets.js` y añadir un `ALTER TABLE tickets ADD COLUMN IF NOT EXISTS nombre_campo...` dentro de la función `ensureTableExists()`.
  2. Dentro del bloque `GET`, agregar la correspondencia del campo hacia el frontend (`nombreCampoFrontend: row.nombre_campo_sql`).
  3. Dentro del bloque `POST`, agregar el campo a la cláusula `INSERT ... ON CONFLICT (...) DO UPDATE SET nombre_campo_sql = COALESCE(EXCLUDED.nombre_campo_sql, tickets.nombre_campo_sql)`.
  4. En el Frontend, actualizar componentes (`AgentPanel.jsx` o `ChatArea.jsx`) para enviar o renderizar la nueva propiedad.
- **Para alterar la IA o la lógica de negocio:** Revisa `src/services/` directamente. Las métricas de confianza o los roles tienen la lógica aislada para que los componentes de UI permanezcan limpios.
