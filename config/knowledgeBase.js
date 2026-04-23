/**
 * Base de conocimiento personalizada - Soporte Tecnológico UdeM
 * 
 * Edita este archivo para agregar, modificar o eliminar soluciones.
 * Cada entrada tiene: tema, problema y solucion.
 * Esta información se inyecta en el contexto del modelo de IA
 * para que pueda dar respuestas precisas sobre la universidad.
 */

const knowledgeBase = [
    // ── Correo Institucional ──────────────────────────────────────
    {
        tema: "Correo Institucional",
        problema: "Cambio o restablecimiento de contraseña del correo institucional",
        solucion: `Para cambiar o restablecer la contraseña de tu correo institucional (@udemedellin.edu.co), sigue estos pasos:
1. Ingresa al portal oficial de UdeM Virtual (https://udemvirtual.udem.edu.co).
2. Haz clic en la opción "¿Olvidó su contraseña?" que aparece debajo del formulario de login.
3. Ingresa tu correo institucional completo (ejemplo: usuario@udemedellin.edu.co).
4. Revisa tu bandeja de entrada (o la carpeta de spam) y sigue las instrucciones del enlace enviado.
5. Crea una nueva contraseña segura (mínimo 8 caracteres, incluyendo mayúsculas, minúsculas, números y un carácter especial).
Nota: Si no recibes el correo en 10 minutos, contacta la mesa de ayuda al ext. 4123.`
    },
    {
        tema: "Correo Institucional",
        problema: "No se puede iniciar sesión en el correo institucional",
        solucion: `Si no puedes iniciar sesión en tu correo institucional:
1. Verifica que estés usando la dirección completa: usuario@udemedellin.edu.co.
2. Asegúrate de no tener activado el Bloq Mayús (Caps Lock).
3. Intenta restablecer la contraseña desde el portal oficial: https://udemvirtual.udem.edu.co → "¿Olvidó su contraseña?".
4. Si el problema persiste, verifica que tu cuenta esté activa contactando la mesa de ayuda al ext. 4123 o al correo soportetic@udem.edu.co.
5. Limpia la caché y cookies de tu navegador o intenta en modo incógnito.`
    },
    {
        tema: "Correo Institucional",
        problema: "Configurar correo institucional en el celular",
        solucion: `Para configurar tu correo institucional en tu dispositivo móvil:
1. Descarga la app Microsoft Outlook desde la App Store (iOS) o Play Store (Android).
2. Abre la aplicación y toca "Agregar cuenta".
3. Ingresa tu correo completo: usuario@udemedellin.edu.co.
4. Ingresa tu contraseña institucional.
5. Acepta los permisos de sincronización.
6. Tu correo, calendario y contactos institucionales se sincronizarán automáticamente.
Alternativa: También puedes usar la app nativa de correo de tu dispositivo seleccionando "Microsoft Exchange" como tipo de cuenta.`
    },

    // ── LMS Canvas ────────────────────────────────────────────────
    {
        tema: "LMS Canvas",
        problema: "No puedo ingresar a la plataforma LMS Canvas",
        solucion: `Si no puedes acceder a Canvas LMS:
1. Ingresa a https://udem.instructure.com.
2. Haz clic en "¿Olvidó su contraseña?" debajo del formulario de login.
3. Ingresa tu correo institucional completo (@udemedellin.edu.co).
4. Revisa tu bandeja de entrada y sigue las instrucciones del enlace enviado.
5. Si el enlace no funciona, intenta en un navegador diferente (se recomienda Google Chrome o Firefox).
6. Si el problema persiste, contacta la mesa de ayuda al ext. 4123.`
    },
    {
        tema: "LMS Canvas",
        problema: "No aparecen mis cursos en Canvas",
        solucion: `Si no puedes ver tus cursos en Canvas:
1. Verifica que tu matrícula esté activa para el periodo actual en el Autoservicio estudiantil.
2. Revisa la sección "Cursos" → "Todos los cursos" en el menú lateral de Canvas.
3. Si el curso aún no aparece, es posible que el docente no haya publicado el curso todavía. Contacta directamente al profesor.
4. Si tu matrícula está activa y el curso está publicado pero no lo ves, contacta la mesa de ayuda al ext. 4123 con tu número de documento y el nombre del curso.`
    },
    {
        tema: "LMS Canvas",
        problema: "No puedo subir archivos o tareas en Canvas",
        solucion: `Si tienes problemas para subir archivos en Canvas:
1. Verifica que el archivo no supere el límite de tamaño (generalmente 500 MB).
2. Asegúrate de que el formato del archivo sea compatible (PDF, DOCX, XLSX, JPG, PNG).
3. Intenta en otro navegador (preferiblemente Google Chrome).
4. Desactiva temporalmente extensiones del navegador como bloqueadores de anuncios.
5. Si la fecha de entrega ya pasó, el enlace de envío puede estar cerrado. Contacta a tu profesor.`
    },

    // ── Internet Institucional ────────────────────────────────────
    {
        tema: "Internet Institucional (WiFi)",
        problema: "No puedo conectarme al WiFi de la universidad",
        solucion: `Para conectarte al WiFi institucional:
1. Busca la red "UdeM_Estudiantes" (estudiantes) o "UdeM_Funcionarios" (empleados).
2. Ingresa con tu usuario institucional (sin @udemedellin.edu.co) y tu contraseña del correo.
3. Si no conecta, "olvida" la red desde la configuración WiFi de tu dispositivo y vuelve a conectarte.
4. Verifica que tu adaptador WiFi esté habilitado y que no estés en modo avión.
5. En algunos casos, es necesario registrar la dirección MAC de tu dispositivo. Envía un correo a soportetic@udem.edu.co con tu nombre completo, número de documento y la dirección MAC del dispositivo.
6. Para obtener tu dirección MAC: Windows → cmd → "ipconfig /all" → busca "Dirección física". Mac → Preferencias de Sistema → Red → Avanzado → Hardware.`
    },
    {
        tema: "Internet Institucional (WiFi)",
        problema: "Internet institucional lento o intermitente",
        solucion: `Si experimentas lentitud en el WiFi institucional:
1. Cambia a otra red disponible (por ejemplo, de "UdeM_Estudiantes" a "UdeM_Eduroam" si tienes acceso).
2. Aléjate de zonas con alta concurrencia de dispositivos.
3. Reinicia el adaptador WiFi de tu dispositivo (desactívalo y actívalo nuevamente).
4. En Windows: abre cmd y ejecuta "ipconfig /flushdns" para limpiar la caché DNS.
5. Si el problema es generalizado, reporta la incidencia a TI al ext. 4123 indicando tu ubicación exacta (bloque, piso, salón).`
    },

    // ── Plataformas UdeM ──────────────────────────────────────────
    {
        tema: "Plataformas UdeM",
        problema: "No puedo acceder al Autoservicio Estudiantil o SIGAA",
        solucion: `Para acceder al Autoservicio Estudiantil / SIGAA:
1. Ingresa a https://autoservicio.udem.edu.co (Autoservicio) o https://sigaa.udem.edu.co (SIGAA).
2. Usa tu número de documento como usuario y la contraseña asignada.
3. Si olvidaste tu contraseña, haz clic en "Recuperar contraseña" e ingresa tu correo institucional.
4. Navegadores recomendados: Google Chrome o Microsoft Edge (versiones actualizadas).
5. Si el portal muestra errores, intenta limpiar caché y cookies del navegador o usar modo incógnito.
6. Si el problema persiste, contacta la mesa de ayuda al ext. 4123.`
    },
    {
        tema: "Plataformas UdeM",
        problema: "Error al consultar horarios o notas",
        solucion: `Si tienes errores al consultar horarios o notas en el Autoservicio:
1. Verifica que tu matrícula esté activa para el periodo vigente.
2. Intenta acceder en horarios de menor tráfico (evita las primeras horas del día).
3. Usa Google Chrome actualizado y limpia la caché del navegador.
4. Si el error dice "Sesión expirada", cierra todas las pestañas del navegador e intenta de nuevo.
5. Reporta el error exacto (captura de pantalla) a soportetic@udem.edu.co.`
    },

    // ── Software Institucional ────────────────────────────────────
    {
        tema: "Software Institucional",
        problema: "Activar licencia de Office 365 / Microsoft 365",
        solucion: `Como estudiante o empleado de la UdeM, tienes acceso gratuito a Microsoft 365:
1. Ingresa a https://portal.office.com.
2. Inicia sesión con tu correo institucional: usuario@udemedellin.edu.co.
3. Una vez dentro, haz clic en "Instalar Office" → "Aplicaciones de Microsoft 365".
4. Descarga e instala el paquete completo (Word, Excel, PowerPoint, etc.).
5. Al abrir cualquier aplicación de Office, inicia sesión con tu correo institucional para activar la licencia.
6. La licencia se renueva automáticamente mientras seas estudiante o empleado activo.`
    },
    {
        tema: "Software Institucional",
        problema: "Acceso a software especializado o laboratorios virtuales",
        solucion: `Para acceder a software especializado de la universidad:
1. Consulta la disponibilidad del software en la página de Recursos TI: https://udem.edu.co/recursos-ti.
2. Algunos programas están disponibles únicamente en los laboratorios de cómputo del campus.
3. Para solicitar instalaciones remotas o acceso a laboratorios virtuales, envía un correo a soportetic@udem.edu.co indicando el software requerido y la justificación académica.
4. Software como MATLAB, SPSS o AutoCAD puede tener licencias educativas gratuitas. Consulta con tu programa académico.`
    },

    // ── VPN y Acceso Remoto ───────────────────────────────────────
    {
        tema: "VPN y Acceso Remoto",
        problema: "Configurar VPN para acceso remoto a recursos institucionales",
        solucion: `Para conectarte a la VPN institucional:
1. Descarga el cliente VPN indicado por TI (generalmente FortiClient o GlobalProtect).
2. Configura la conexión con el servidor: vpn.udem.edu.co.
3. Ingresa tu usuario institucional y contraseña del correo.
4. Una vez conectado, tendrás acceso a recursos internos como bases de datos, repositorios y sistemas administrativos.
5. Si necesitas acceso VPN, primero solicítalo al correo soportetic@udem.edu.co indicando tu rol y los recursos que necesitas acceder.`
    },

    // ── Impresión y Escaneo ───────────────────────────────────────
    {
        tema: "Impresión Institucional",
        problema: "No puedo imprimir desde los computadores del campus",
        solucion: `Para usar las impresoras del campus:
1. Asegúrate de estar conectado a la red institucional (WiFi o cable).
2. Las impresoras del campus se configuran automáticamente en los equipos de los laboratorios.
3. Si la impresora no aparece, ve a Configuración → Dispositivos → Impresoras y selecciona "Agregar impresora".
4. Para impresión desde tu portátil personal, necesitas instalar los drivers. Consulta en la mesa de ayuda (ext. 4123) cuál es la impresora de tu bloque y su dirección IP.
5. Asegúrate de tener saldo disponible en tu cuenta de impresión estudiantil.`
    }
];

export default knowledgeBase;
