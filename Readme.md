
<p align="center">
  <img src="frontend/src/assets/logo_pachangapp.png" alt="PachangApp Logo" width="100%">
</p>

PachangApp es una plataforma integral para la gestión y organización de partidos de fútbol y torneos, potenciada por Inteligencia Artificial y diseñada con una arquitectura moderna y escalable.



## 🚀 Características Principales

-   **🤖 PachanBot (IA):**  Asistente inteligente integrado vía n8n para resolver dudas sobre reservas, buscar partidos y asistir al usuario en tiempo real.
-   **🏆 Gestión de Torneos:** Sistema completo para la creación de torneos, visualización de cuadros (brackets) y seguimiento de resultados.
-   **🌍 Multi-idioma:** Soporte completo para **Español** e **Inglés** utilizando i18next, con detección automática de idioma.
-   **📱 Mobile Ready:** Aplicación optimizada para dispositivos móviles y empaquetada con **Capacitor** para despliegue nativo en Android.
-   **💬 Comunicación Social:** Chats integrados por torneo para coordinar partidos con otros jugadores.
-   **🌗 Temas Personalizables:** Soporte para modo claro/oscuro y temas dinámicos mediante DaisyUI.

---

## 🛠️ Stack Tecnológico

### Frontend
-   **React 19 + Vite:** SPA rápida y moderna.
-   **Tailwind CSS + DaisyUI:** Diseño responsivo y componentes premium.
-   **Framer Motion:** Animaciones fluidas y micro-interacciones.
-   **Capacitor:** Puente para aplicaciones nativas móviles.

### Backend
-   **Java 17 + Spring Boot:** API REST robusta y escalable.
-   **Spring Data JPA:** Gestión eficiente de la persistencia.
-   **MySQL:** Base de datos relacional para consistencia de datos.

### Integraciones y DevOps
-   **n8n:** Orquestación de flujos de IA y webhooks.
-   **Docker & Docker Compose:** Contenerización para despliegue local y producción.
-   **Kubernetes (k8s):** Orquestación de contenedores para alta disponibilidad.
-   **Google OAuth:** Autenticación social simplificada.

---

## 📁 Estructura del Proyecto

### [Backend](Spring Boot)
-   **`models/`**: Entidades JPA que definen la estructura de la base de datos.
-   **`repositories/`**: Interfaces para el acceso a datos.
-   **`controllers/`**: Endpoints de la API REST para usuarios, partidos y torneos.
-   **`config/`**: Configuraciones de seguridad, CORS y beans de sistema.

### [Frontend] (React)
-   **`src/pages/`**: Vistas principales (Inicio, Explorar, Torneos, Perfil, etc.).
-   **`src/components/`**: Componentes reutilizables y UI (ChatBot, Navbar, Cards).
-   **`src/locales/`**: Archivos de traducción JSON.
-   **`src/context/`**: Proveedores de estado global (Toasts, Autenticación).

---

## ⚙️ Configuración y Ejecución

### Requisitos Previos
-   **JDK 17** y **Node.js 18+**.
-   **MySQL Server** (Puerto 3306).
-   **Docker** (Opcional, para despliegue simplificado).

### Despliegue con Docker (Recomendado)
Para levantar todo el entorno (DB + Backend + Frontend):
```bash
docker-compose up -d
```

### Ejecución en Desarrollo

#### 1. Backend
```bash
cd backend
.\mvnw spring-boot:run
```
El servidor arrancará en `http://localhost:8091`.

#### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

#### 3. Traducciones
Si añades nuevas claves de traducción, puedes sincronizarlas usando el script:
```bash
node updateTranslate.js
```

---

## 🌐 Integración con IA (n8n)
<img src="frontend/src/assets/PachanBot.png" alt="PachanBot" width="100%" align="center">

PachangApp utiliza un webhook para conectar el chatbot con un flujo de n8n.
-   **Endpoint:** `https://n8n.pachangapp.es/webhook/pachanbot-chat`
-   **Payload:** `{ "chatInput": "mensaje", "language": "es", "sessionId": "id" }`

---

¡Disfruta del juego! ⚽
