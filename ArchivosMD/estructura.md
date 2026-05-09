# 🗂️ Estructura del Proyecto PachangApp

---

## 📁 Raíz del proyecto

```
PachangApp/
├── frontend/          → App React (Vite) + Capacitor (móvil)
├── backend/           → API REST Spring Boot (Java)
├── k8s/               → Manifiestos Kubernetes (despliegue AWS)
├── scripts/           → Scripts de provisión servidor/infra
├── .github/workflows/ → CI/CD con GitHub Actions
├── ArchivosMD/        → Documentación del proyecto
├── docker-compose.yml → Levanta todo el entorno local (front + back + db)
├── campos.csv         → Datos semilla de campos deportivos
└── updateTranslate.js → Script para sincronizar traducciones i18n
```

---

## ⚛️ Frontend — `frontend/src/`

| Archivo | Qué hace |
|---|---|
| `main.jsx` | Punto de entrada, monta React + i18n |
| `App.jsx` | Router principal, define todas las rutas |
| `App.css` | Estilos globales de la app |
| `apiConfig.js` | URL base del backend (dev/prod) |
| `i18n.js` | Configuración de idiomas (ES/EN) |

### 📄 Páginas — `pages/`

| Archivo | Qué hace |
|---|---|
| `Inicio.jsx` | Home: campos destacados, partidos trending, actividad |
| `Login.jsx` | Pantalla de inicio de sesión |
| `Register.jsx` | Pantalla de registro de usuario |
| `Auth.jsx` | Lógica compartida de autenticación (contexto) |
| `CrearPartido.jsx` | Formulario para crear un partido |
| `BuscarPartidos.jsx` | Búsqueda y listado de partidos disponibles |
| `MatchDetail.jsx` | Detalle de un partido (unirse, chat, info) |
| `Torneos.jsx` | Listado de torneos |
| `CrearTorneo.jsx` | Formulario para crear un torneo |
| `TorneoDetail.jsx` | Detalle de torneo (bracket, chat, equipos) |
| `Perfil.jsx` | Perfil del usuario (datos, stats, historial) |
| `Conocenos.jsx` | Página informativa "Sobre nosotros" |
| `Admin.jsx` | Panel de administración |

### 🧩 Componentes — `components/`

| Archivo | Qué hace |
|---|---|
| `Navbar.jsx` | Barra de navegación superior |
| `ChatBot.jsx` | PachanBot — chatbot IA integrado con n8n |
| `BookingModal.jsx` | Modal para reservar campo |
| `CreateMatchModal.jsx` | Modal para crear partido rápido |
| `DatePicker.jsx` | Selector de fecha personalizado |
| `Dropdown.jsx` | Componente dropdown reutilizable |
| `FieldCard.jsx` | Tarjeta visual de un campo deportivo |
| `MatchCard.jsx` | Tarjeta visual de un partido |
| `StatCard.jsx` | Tarjeta de estadística (perfil/admin) |
| `Counter.jsx` | Animación de contador numérico |
| `CaptchaGrid.jsx` | Captcha visual tipo grid |
| `LanguageSelector.jsx` | Selector de idioma ES/EN |
| `TournamentCard.jsx` | Tarjeta de torneo |
| `TournamentBracket.jsx` | Visualización del cuadro/bracket |
| `TournamentChat.jsx` | Chat en tiempo real del torneo |

### 🏠 Componentes Home — `components/home/`

| Archivo | Qué hace |
|---|---|
| `CamposDestacados.jsx` | Carrusel de campos destacados |
| `TrendingMatches.jsx` | Partidos populares/recientes |
| `ActivityWidget.jsx` | Widget de actividad reciente |
| `QuickFilters.jsx` | Filtros rápidos (deporte, zona…) |
| `BottomNav.jsx` | Navegación inferior (móvil) |

### 🔧 Servicios y Utilidades

| Archivo | Qué hace |
|---|---|
| `services/uploadService.js` | Subida de archivos (imágenes) al backend |
| `utils/dateFormatter.js` | Formateo de fechas |
| `utils/fieldMapping.js` | Mapeo de nombres de campos para la UI |
| `locales/es.json` | Traducciones en español |
| `locales/en.json` | Traducciones en inglés |

---

## ☕ Backend — `backend/src/main/java/com/pachangapp/`

| Archivo | Qué hace |
|---|---|
| `BackendApplication.java` | Clase main de Spring Boot |

### 🎮 Controllers — `controllers/`

| Archivo | Qué hace |
|---|---|
| `UserController.java` | CRUD usuarios, login, registro, perfil |
| `PartidoController.java` | CRUD partidos, unirse, abandonar |
| `CampoController.java` | Listado y detalle de campos |
| `ReservaController.java` | Gestión de reservas de campos |
| `TournamentController.java` | CRUD torneos, inscripción equipos |
| `TournamentChatController.java` | Chat en tiempo real de torneos |
| `AdminController.java` | Endpoints de administración |
| `MensajeController.java` | Mensajería entre usuarios |
| `FileController.java` | Descarga/gestión de archivos |
| `UploadController.java` | Subida de archivos (imágenes) |
| `CaptchaController.java` | Validación del captcha |
| `AIController.java` | Proxy para el chatbot IA (n8n) |
| `WeatherController.java` | Consulta del clima (API externa) |

### 📦 Models — `models/`

| Archivo | Qué hace |
|---|---|
| `User.java` | Entidad usuario |
| `Partido.java` | Entidad partido |
| `Campo.java` | Entidad campo deportivo |
| `Reserva.java` | Entidad reserva |
| `Tournament.java` | Entidad torneo |
| `TournamentMatch.java` | Entidad partido de torneo |
| `Team.java` | Entidad equipo |
| `Participacion.java` | Relación usuario ↔ partido |
| `Mensaje.java` | Entidad mensaje |
| `ChatMessage.java` | Entidad mensaje de chat torneo |
| `Role.java` | Enum de roles (USER, ADMIN) |

### 📂 Repositories — `repositories/`

> Interfaces JPA — acceso a base de datos para cada entidad.  
> Mismo nombre que el modelo + `Repository` (ej: `UserRepository.java`).

### ⚙️ Services — `services/`

| Archivo | Qué hace |
|---|---|
| `AIService.java` | Conexión con la IA/n8n |
| `EmailService.java` | Envío de correos |
| `FileService.java` | Gestión de archivos en disco/S3 |
| `PdfService.java` | Generación de PDFs (reservas, informes) |
| `ReservaService.java` | Lógica de negocio de reservas |
| `TournamentService.java` | Lógica de torneos (bracket, resultados) |
| `WeatherService.java` | Consulta API del clima |

### 🔐 Security — `security/`

| Archivo | Qué hace |
|---|---|
| `jwt/JwtAuthFilter.java` | Filtro que intercepta y valida el token JWT |
| `jwt/JwtUtils.java` | Genera y parsea tokens JWT |
| `services/UserDetailsImpl.java` | Adapta User al modelo de Spring Security |
| `services/UserDetailsServiceImpl.java` | Carga usuario desde BD para autenticación |

### 🛠️ Config — `config/`

| Archivo | Qué hace |
|---|---|
| `SecurityConfig.java` | Configura rutas protegidas, CORS, filtros |
| `WebConfig.java` | Configuración CORS adicional |

### 📋 Recursos — `resources/`

| Archivo | Qué hace |
|---|---|
| `application.properties` | Configuración: BD, JWT secret, puertos, S3 |

---

## ☸️ Kubernetes — `k8s/`

| Archivo | Qué hace |
|---|---|
| `backend.yaml` | Deployment + Service del backend |
| `frontend.yaml` | Deployment + Service del frontend |
| `mysql.yaml` | Deployment + Service + PVC de MySQL |
| `n8n.yaml` | Deployment + Service de n8n (chatbot) |
| `ingress.yaml` | Ingress con reglas de dominio + TLS |
| `clusterissuer.yaml` | Cert-Manager para certificados SSL |
| `secrets.yaml` | Secrets de Kubernetes (credenciales) |

---

## 🚀 CI/CD & Scripts

| Archivo | Qué hace |
|---|---|
| `.github/workflows/deploy.yml` | Pipeline: build → push Docker → deploy a K8s |
| `scripts/01-setup-server.sh` | Provisión del servidor EC2 |
| `scripts/02-setup-github-secrets.ps1` | Configura secrets en GitHub |
| `scripts/03-setup-s3.sh` | Crea bucket S3 para archivos |
| `scripts/04-setup-rds.sh` | Configura base de datos RDS |

---

## 🗺️ Flujo rápido: ¿Dónde toco para…?

| Quiero… | Voy a… |
|---|---|
| Cambiar una pantalla/vista | `frontend/src/pages/` |
| Modificar un componente visual | `frontend/src/components/` |
| Cambiar rutas de la app | `frontend/src/App.jsx` |
| Añadir/cambiar un endpoint API | `backend/.../controllers/` |
| Cambiar lógica de negocio | `backend/.../services/` |
| Modificar la base de datos | `backend/.../models/` + `repositories/` |
| Tocar la seguridad/JWT | `backend/.../security/` |
| Cambiar config de BD/puertos | `backend/.../application.properties` |
| Modificar el despliegue | `k8s/` o `.github/workflows/` |
| Añadir/editar traducciones | `frontend/src/locales/` |
| Configurar el chatbot | `frontend/.../ChatBot.jsx` + `backend/.../AIController.java` |
