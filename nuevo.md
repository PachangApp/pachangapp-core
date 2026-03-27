# Evolución del Proyecto - PachangApp

Este archivo detalla los cambios realizados en el proyecto fase por fase para tener un control claro de las nuevas funcionalidades y mejoras.

---

## ✅ Fase 1: Seguridad y Arquitectura Base (Autenticación JWT y Roles)

Antes de esta fase, el sistema era inseguro: las contraseñas se comparaban en texto plano (o de forma básica) y no existía un sistema de tokens. Cualquiera podía acceder a los endpoints de la API sin restricciones reales.

### ¿Qué ha cambiado?
1.  **Sistema de Roles**: Ahora existen dos roles definidos: `USER` y `ADMIN`.
    *   **USER**: Rol por defecto para nuevos registros. Podrá realizar reservas.
    *   **ADMIN**: Rol con privilegios elevados para gestionar todo el sistema.
2.  **Seguridad JWT (Stateless)**: Se ha implementado la autenticación mediante JSON Web Tokens.
    *   El servidor ya no "recuerda" la sesión (stateless), lo que lo hace más escalable y seguro para aplicaciones móviles.
    *   El login ahora devuelve un **Token** que el frontend debe enviar en cada petición protegida.
3.  **Protección de Endpoints**:
    *   `/api/users/login` y `/api/users/register` son públicos.
    *   El resto de la API requiere un token válido.
    *   Se han sentado las bases para restringir acciones específicas solo a administradores.
4.  **Cifrado de Contraseñas**: Se utiliza `BCrypt` para asegurar que las contraseñas nunca se guarden ni se procesen en texto plano en la base de datos.

---

## ✅ Fase 2: Administración y Gestión de Datos (Backoffice y Logs)

Antes de esta fase, no había forma de gestionar los datos desde el backend (CRUD) sin tocar la base de datos directamente. Tampoco había un sistema de persistencia de logs ni herramientas de importación/exportación.

### ¿Qué ha cambiado?
1.  **Panel de Administración (Backoffice API)**:
    *   Nuevo controlador `AdminController` protegido por el rol `ADMIN`.
    *   Funcionalidad para listar y eliminar usuarios.
    *   Funcionalidad para cambiar el rol de un usuario (ascender a ADMIN).
    *   CRUD completo para la gestión de **Campos** (Pistas).
2.  **Importación y Exportación de Datos**:
    *   **Exportar Reservas**: Ahora el administrador puede descargar un archivo **CSV** con todas las reservas registradas.
    *   **Importar Pistas**: Se ha habilitado la carga masiva de campos de deporte mediante un archivo **CSV**.
3.  **Sistema de Logging Avanzado**:
    *   Se ha configurado `logback-spring.xml` para que el servidor guarde logs detallados en archivos persistentes (`logs/pachangapp.log`).
    *   **Rotación diaria**: Los logs se archivan por día para facilitar la auditoría y evitar que un solo archivo crezca sin control.
4.  **Seguridad Granular (RBAC)**: Se ha activado `@EnableMethodSecurity`, lo que permite que solo los usuarios con rol `ADMIN` puedan llamar a los nuevos endpoints de gestión.

---

## ✅ Fase 3: Servicios Complementarios (PDF, Email y Archivos)

Antes de esta fase, el sistema carecía de interacción real con el usuario (sin correos) y no permitía la generación de documentos oficiales ni la subida de archivos multimedia.

### ¿Qué ha cambiado?
1.  **Validación de Cuentas por Email**:
    *   Nuevo sistema de registro en dos pasos: Registro -> Email de Verificación -> Activación.
2.  **Generación de Justificantes PDF**:
    *   Integración de `iText` y `html2pdf`.
    *   Endpoint dedicado `/api/reservas/{id}/export-pdf` para descargar un recibo profesional.
3.  **Gestión de Archivos (Uploads)**:
    *   Nuevos endpoints para subir (`/api/files/upload`) y servir imágenes.

---

## ✅ Fase 4: Integración Avanzada (IA y Web Services)

### ¿Qué ha cambiado?
1.  **Consumo de Servicio Web Externo (Clima)**: Integración con la API de **OpenWeatherMap** (`/api/weather`).
2.  **Inteligencia Artificial (OpenAI)**: Integración con **GPT-3.5 Turbo** (`/api/ai/chat`) para asistencia inteligente.
3.  **Configuración Segura**: Centralización de API Keys en `application.properties`.

---

## 🚀 Guía de Pruebas (Mini-Tutorial)

Para comprobar que todo funciona correctamente, sigue estos pasos:

### 1. Usuarios y Roles
> [!IMPORTANT]
> **Usuarios Antiguos**: Los usuarios creados antes de estos cambios **no funcionarán correctamente** (faltan campos obligatorios). Se recomienda **registrar nuevos usuarios**.
1.  **Registro**: Crea uno en `/api/users/register`.
2.  **Activación**: Pon `enabled = 1` en la base de datos o usa el token generado.
3.  **Login**: Haz login en `/api/users/login`. Recibirás un **token JWT**.

### 2. Backoffice (ADMIN)
1.  **CSV**: Descarga el historial en `GET /api/admin/reservas/export`.
2.  **Campos**: Importa pistas enviando un CSV a `POST /api/admin/campos/import`.

### 3. Servicios Extras
1.  **PDF**: Genera un reporte en `GET /api/reservas/{id}/export-pdf`.
2.  **IA/Clima**: Prueba los endpoints de `/api/ai` y `/api/weather` (tras configurar las claves).

---

## 📋 Checklist de Cumplimiento (Entorno Servidor)
- [x] Gestión administrativa y backoffice.
- [x] Autenticación stateless (JWT+Roles).
- [x] Consumo de Servicio Web (Weather).
- [x] Generación de PDF.
- [x] Validación por Correo.
- [x] Gestión de Archivos (Upload).
- [x] Importación/Exportación CSV.
- [x] Auditoría mediante Logs persistentes.
- [x] Integración IA (OpenAI).
