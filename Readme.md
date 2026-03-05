# PachangApp

Este proyecto está dividido en dos partes principales:

1. **Backend**: Desarrollado en Java con Spring Boot.
2. **Frontend**: Desarrollado en React con Vite.
3. **Base de Datos**: MySQL.

Esta estructura proporciona una base limpia para comenzar a trabajar en las funcionalidades principales de la aplicación.

## Estructura del Proyecto (Qué es cada cosa)

### Backend (Spring Boot / Java)

Entender la arquitectura MVC (Model-View-Controller) en Spring es clave. Aquí el flujo de datos va desde la petición web (Controller), hacia la base de datos (Repository), basándose en las tablas (Models).

- **`models/` (Entidades)**: Aquí se definen las tablas de la base de datos como clases de Java. Por ejemplo, `User.java` representa la tabla de usuarios en MySQL. Cada atributo es una columna.
- **`repositories/` (Acceso a Datos)**: Son interfaces (ej. `UserRepository.java`) que hacen la "magia" de conectarse a MySQL. Nos permiten hacer consultas (guardar, buscar por email, borrar) sin necesidad de escribir código SQL manual, gracias a Spring Data JPA.
- **`controllers/` (Rutas y Endpoints)**: Aquí se reciben las peticiones del frontend. `UserController.java` tiene los endpoints `/api/users/register` y `/api/users/login`. Es el puente entre React y nuestra lógica de base de datos.
- **`application.properties`**: Archivo de configuración maestro (dentro de `src/main/resources/`). Aquí le decimos a Spring cómo conectarse a MySQL (URL, usuario, contraseña) y en qué puerto arrancar.
- **`pom.xml`**: Gestiona las dependencias (librerías) del proyecto, equivalente al `package.json` de Node.

### Frontend (React / Vite)

- **`src/pages/`**: Carpetas para las vistas principales de la aplicación por las que navegaremos (Ej: `Login.jsx`, `Register.jsx`, `Home.jsx`).
- **`src/components/`**: Interfaz reutilizable (Ej: botones generales, barras de navegación, campos de formulario).
- **`src/App.jsx` y `main.jsx`**: Archivos raíz de configuración donde definiremos las rutas (React Router).

## Requisitos Previos

Asegúrate de tener instalado en tu máquina lo siguiente antes de proceder:

- **Java Development Kit (JDK) 17**: [Descargar JDK 17](https://adoptium.net/es/)
- **Node.js** (versión 18 o superior): [Descargar Node.js](https://nodejs.org/)
- **MySQL Server & MySQL Workbench**: [Descargar MySQL](https://dev.mysql.com/downloads/)
- **Git**: [Descargar Git](https://git-scm.com/)
- Tu IDE de preferencia (IntelliJ IDEA, Eclipse, VS Code, etc).

## Configuración y Ejecución del Proyecto

### 1. Base de Datos (MySQL Workbench)

1. Abre **MySQL Workbench** e inicia sesión con el usuario administrador (normalmente `root`).
2. La aplicación backend espera conectarse usando el usuario `root` y la contraseña `root`.
   > **Nota:** Si tu contraseña local de MySQL es diferente, por favor modifica el archivo `backend/src/main/resources/application.properties` en tu rama local, cambiando la línea:
   > `spring.datasource.password=root` por tu contraseña actual. Abstente de subir este cambio específico a GitHub para no pisar la configuración base. Si lo tienes como yo pablo seguramente no tengas contraseña por tanto lo puedes dejar en blanco como esta.
3. Crea la base de datos en blanco. Puedes abrir una pestaña SQL en Workbench y ejecutar:

   ```sql
   CREATE DATABASE IF NOT EXISTS pachangapp_db;
   ```

   _Spring Boot está configurado para actualizar (DML-Auto: Update) las tablas automáticamente, por lo tanto, no necesitas crear las tablas tú mismo, se generarán la primera vez que se corra el backend._

### 2. Backend (Spring Boot)

La estructura inicial incluye los cimientos para que empecemos nuestra tarea: hay un modelo `User`, un `UserRepository`, y un `UserController` vacío preparado para inyectarle el código de Registro y Login.

1. Abre una terminal y colócate en la raíz del proyecto descargado.
2. Navega a la carpeta del backend.
   ```bash
   cd backend
   ```
3. Ejecuta el servidor. (La herramienta Maven descargará de forma automática todas las dependencias necesarias de Spring Boot la primera vez).
   ```bash
   ./mvnw spring-boot:run
   ```
   _(Comando para Windows si usas PowerShell)_
   ```powershell
   .\mvnw spring-boot:run
   ```

El backend se iniciará y se quedará escuchando en `http://localhost:8091`.

### 3. Frontend (React)

1. Abre una _nueva_ terminal (dejando la del backend corriendo) y asegúrate de estar en la raíz de PachangApp.
2. Navega a la carpeta del frontend.
   ```bash
   cd frontend
   ```
3. Instala todas las dependencias mediante NPM.
   ```bash
   npm install
   ```
4. Arranca el servidor de desarrollo de Vite.
   ```bash
   npm run dev
   ```

El frontend estará accesible por defecto en `http://localhost:5173`. Si se abre el navegador verás la base del proyecto front.

## Distribución de Tareas Activas

A partir de esta estructura general, continuaremos el desarrollo con el siguiente reparto:

_Nota: Los endpoints básicos de registro (`/api/users/register`) y login (`/api/users/login`) ya han sido creados en `UserController.java`. Ahora el objetivo principal es hacer la integración visual desde el frontend y añadir configuración de seguridad al backend._

- **Registro de usuarios**: (A mi cargo)
  - Añadir lógica de validación (que no se dupliquen usuarios) y encriptación de contraseñas en el backend.
  - Crear el diseño visual: En el frontend, utilizando las carpetas creadas en `src/pages` (p. ej., `Register.jsx`) y `src/components` (formularios reutilizables).
  - Conectar el formulario de React con el endpoint `POST /api/users/register`.

- **Login de usuarios**: (A tu cargo)
  - Crear una lógica robusta de retención de sesión en el backend (Token JWT o manejador de sesión robusto).
  - Crear el diseño visual: Pantalla de inicio de sesión en `src/pages` (p. ej., `Login.jsx`) y reutilización de componentes de `src/components`.
  - Conectar el formulario de React con el endpoint `POST /api/users/login` y manejar el estado de la sesión enviada por la API.

¡Mucho ánimo con el código!
