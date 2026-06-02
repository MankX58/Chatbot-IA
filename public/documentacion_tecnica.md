# Documentación Técnica Detallada (React, Hooks, Estados y Base de Datos)

Este documento es una inmersión profunda a nivel de código sobre cómo está estructurada la aplicación, enfocándose en la gestión de estados (React Hooks), flujo de control, la infraestructura de la base de datos (PostgreSQL), su comunicación con el backend (API) y cómo el cliente consume esta información.

---

## 1. Arquitectura de Base de Datos y Backend (API)

La aplicación utiliza un enfoque Serverless / API routes alojado en el directorio `api/`. Toda la persistencia ocurre en una base de datos **PostgreSQL**.

### 1.1 Conexión a la Base de Datos (`api/db.js`)
Se utiliza el paquete `pg` (node-postgres) para gestionar un `Pool` de conexiones.
- **Funcionamiento**: Lee la cadena de conexión desde las variables de entorno (`process.env.DATABASE_URL`).
- **Exportación**: Expone una función asincrónica `query(text, params)` que abstrae la conexión al pool. Esta función es la que todos los controladores de la API usan para ejecutar sentencias SQL de manera segura contra inyección SQL usando consultas parametrizadas (`$1, $2`, etc.).

### 1.2 El Controlador Principal (`api/tickets.js`)
Este archivo contiene la lógica de backend para la entidad central del negocio: los **Tickets de Soporte**.
Funciona como un handler HTTP que responde a los métodos `GET`, `POST` y `DELETE`.

#### Auto-Migración de Esquema (`ensureTableExists`)
Al inicio de cada petición, el sistema ejecuta la función `ensureTableExists`. Esto asegura que:
1. **Creación**: Si la tabla `tickets` no existe, la crea con su esquema complejo.
2. **Alteración Dinámica**: Utiliza instrucciones `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...` para inyectar dinámicamente columnas nuevas si el esquema muta (ej. cuando se añadió `owner_name`, `priority`, o `escalation_context`).
Esto permite evolucionar la estructura sin necesidad de herramientas de migración pesadas (como Prisma o TypeORM).

#### Tipos de Datos Clave en PostgreSQL
- `id`: VARCHAR(100) (Primary Key, usualmente un `Date.now()` en string).
- `messages` y `support_responses`: **JSONB**. Esto es crítico. PostgreSQL almacena el historial de chat como un objeto JSON nativo, permitiendo al frontend descargar directamente el arreglo de objetos sin parseos complejos y almacenar arrays de tamaño variable de la conversación.
- Campos de metadatos: `owner_id`, `status`, `preview`, `breadcrumb` son textos/cadenas simples.

#### Operaciones CRUD (`GET`, `POST`, `DELETE`)
1. **GET (Lectura)**:
   - *Condicionales*: Si la URL incluye `?ownerId=ABC`, ejecuta `SELECT * FROM tickets WHERE owner_id = $1`. Si no incluye parámetros (caso de la vista de agente), ejecuta un `SELECT *` total. Ambos se ordenan por `updated_at DESC`.
   - *Transformación*: Mapea directamente desde `snake_case` (DB) hacia `camelCase` (JS/React) antes de enviar la respuesta JSON al cliente (ej: `row.owner_email` a `ownerEmail`).
2. **POST (Creación y Actualización Atómica)**:
   - Extrae todo el payload del `req.body`.
   - Ejecuta un **`INSERT INTO ... ON CONFLICT (id) DO UPDATE SET ...`**. Esta es una estrategia "Upsert". Si el ticket no existe, lo inserta. Si el ID ya existe, actualiza únicamente los campos relevantes.
   - **Uso de `COALESCE`**: Para campos de "solo lectura inicial" o que pueden llegar incompletos en futuras actualizaciones (como `owner_name` o `priority`), se utiliza `COALESCE(EXCLUDED.priority, tickets.priority)`. Esto protege la base de datos de ser sobrescrita con valores nulos o vacíos en peticiones parciales.
3. **DELETE (Borrado)**:
   - Permite borrar por `ticketId` o vaciar todo el historial de un `ownerId`.

---

## 2. Motor Central del Frontend: `App.jsx`
Este es el controlador principal de la UI React tras el inicio de sesión. 

### Hooks y Estados Principales (`useState`)
- **`activeSection`**: Define qué panel renderizar (`APP_SECTIONS.CHAT`, `APP_SECTIONS.AGENT`). 
- **`messages`**: El historial actual de la conversación del estudiante (`[{ role: 'user' | 'assistant' | 'context', content: '...', confidence: {...} }]`). Esta estructura en memoria es la que eventualmente viaja por el POST hacia la columna de tipo JSONB en PostgreSQL.
- **`isSidebarCollapsed`**: Booleano almacenado en `localStorage`.
- **`isLoading` y `chatLocked`**: Controlan bloqueos en la interfaz (esperando IA o chat finalizado).

### Ciclo de Vida y Flujos de Comunicación
- **Seguridad**: El acceso a las secciones reacciona a los roles calculados por Auth0 (`accessControl.js`). Si un estudiante intenta ver el panel de agentes, el `useEffect` detecta la carencia de permisos y lo devuelve a `APP_SECTIONS.CHAT`.
- **Flujo de Envío a la DB (`saveChatToTickets`)**: 
  Se invoca al cerrar o escalar. Toma todo el estado local `messages`, lo decora con metadatos de usuario (nombre y email obtenidos de Auth0) y la prioridad calculada (basada en el último `confidence` del bot), para luego pasarlo a la función del hook `saveTicket` que hará el llamado `fetch(POST)`.

---

## 3. Capa de Red y Estado Local (Hooks)

### El Hook de Estudiantes: `useChatHistory.js`
Abstrae la conexión entre el estudiante y la API.
- **Polling (Tiempo Real Falso)**: Usa un `setInterval` de 5 segundos que ejecuta un `GET` a la API de forma "silenciosa".
- **Resiliencia (Fallback)**: Si el llamado a PostgreSQL falla, el hook invoca utilidades de `browserStorage.js` para recuperar o guardar los tickets localmente en el navegador, asegurando que un fallo de red no rompa la aplicación para el estudiante.
- **Inserción**: `saveTicket` y `updateSingleTicket` orquestan el POST a `/api/tickets` y la actualización síncrona del estado local React.

### El Hook de Agentes: `useSupportTickets.js`
Espejo del anterior pero para la consola de administración.
- Ejecuta `GET` sin filtros, trayendo la base de datos completa.
- **Actualizaciones Optimistas**: En métodos como `setTicketPriority` o `setTicketStatus`, el hook modifica la variable local `tickets` mediante `setTickets` de forma *inmediata*. Paralelamente, lanza el `POST` a PostgreSQL. Esto engaña al ojo humano dándole un tiempo de respuesta de "0ms" al usuario, mientras la base de datos procesa el cambio en background.

---

## 4. Paneles Operativos

### 4.1 Vista de Usuario (`ChatArea.jsx`)
Encapsula la interacción de la persona que pide ayuda.
- **Refs (`useRef`)**: `messagesEndRef` permite hacer "auto-scroll" nativo al final del chat tras cada re-render que involucre nuevos mensajes.
- **Feedback Loop**: Levanta modales interactivos para calificar la IA. Cuando el usuario escala a un agente, el componente transmite a `App.jsx` su texto de contexto mediante la función `onEscalated`, delegando todo cálculo de metadatos al contenedor superior.

### 4.2 Consola Administrativa (`AgentPanel.jsx`)
Vista Maestro-Detalle (Master-Detail).
- Obtiene sus poderes consumiendo `useSupportTickets`.
- **Estados Nativos**: `statusFilter` y `priorityFilter` permiten aplicar programación funcional nativa de arreglos de Javascript (`.filter`) sobre el listado en memoria devuelto por PostgreSQL, minimizando consultas a la API.
- **Interactividad Directa**: Incorpora controles que inyectan datos directamente a PostgreSQL, como el `<select>` de prioridad que invoca `setTicketPriority`, forzando la actualización de la fila en BD, y un `<textarea>` para el envío de respuestas de soporte, enlazado a `registerSupportResponse`.

---

## 5. Resumen de Viaje del Dato (Data Flow)
Si un usuario envía "Tengo problemas con el correo" y escala a soporte:
1. `ChatArea.jsx` actualiza su estado `messages` localmente.
2. Al escalar, `ChatArea` invoca un callback en `App.jsx`.
3. `App.jsx` extrae las métricas del último mensaje del bot de los `messages` (ej. Confianza: Baja) y determina que el caso tiene "Prioridad: Alta".
4. Llama a la función `saveTicket` del hook `useChatHistory`.
5. `useChatHistory` arma un objeto gigante y lo serializa a JSON para enviarlo mediante un fetch `POST` a `/api/tickets`.
6. En el backend, `api/tickets.js` parsea el body, ejecuta la inserción con `pg` en la tabla `tickets` del servidor PostgreSQL, transformando el array de mensajes a tipo de dato `JSONB`. Retorna éxito.
7. Un Agente, que está en `AgentPanel.jsx`, tiene su hook `useSupportTickets` haciendo "Polling" a `/api/tickets` cada 5 segundos. Detecta la nueva fila en base de datos.
8. La UI del agente se actualiza instantáneamente; el agente puede modificar propiedades, repitiendo el ciclo en reversa hacia la base de datos.
