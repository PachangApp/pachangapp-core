# Plan de Acción - PachangApp (Proyecto Integrado 2º DAW)

Este documento es una guía paso a paso para cumplir con todos los requisitos del Proyecto Integrado. Puedes ir marcando con una `x` (`[x]`) las tareas que ya tengas completadas.

## 1. Aspectos Generales
- [ ] **Explicación y objetivo del sitio**: Crear una landing page o sección "Sobre Nosotros" que explique claramente cómo PachangApp soluciona el problema de buscar pistas centralizando la oferta de todos los proveedores.
- [ ] **Arquitectura de la aplicación**: Redactar un documento con un diagrama de la arquitectura (Frontend, Backend, Base de Datos, n8n, API externas).
- [ ] **Diseño visual y Mapa de navegación**: Elaborar en Figma un diagrama de navegación y asegurar que los componentes visuales sean homogéneos.
- [ ] **Valor añadido (Versión Móvil - Capacitor)**:
  - Implementar la versión móvil utilizando **Capacitor** para reutilizar el 100% del código React/Vite.
  - Sincronizar con **Android Studio** para generar el APK nativo.
  - Desarrollar componentes "Mobile-First" asegurando que el diseño de DaisyUI se vea perfecto en pantallas pequeñas.

- [ ] **Documentación completa**: Recopilar y unificar manuales, memoria del proyecto y guías en un solo formato, libres de errores ortográficos.

## 2. Desarrollo en Entorno Servidor
*La lógica central y gestión de datos desde el backend (ej. Spring Boot, Node.js).*
- [ ] **Administración del sistema**: Crear un panel (Backoffice) en el backend (o APIs protegidas) para gestionar entidades: pistas, proveedores, usuarios, reservas y roles.
- [ ] **Autenticación mediante Token**: Asegurar el acceso desde el front-end a datos sensibles (como historial de reservas) usando JWT (JSON Web Tokens).
- [ ] **Consumo de servicio web**: Integrar desde el servidor una API de terceros. Por ejemplo, una API meteorológica para informar del clima en la hora reservada o una pasarela de pago (Stripe).
- [ ] **Generación de informes PDF**: Implementar un endpoint que devuelva un recibo o justificante de la reserva de la pista en formato PDF.
- [ ] **Validación de cuentas por correo**: Enviar un e-mail con un enlace único cuando alguien se registra para verificar y activar la cuenta.
- [ ] **Gestión de archivos**: 
  - [ ] **Subida**: Permitir a los usuarios subir imágenes de perfil o fotos de las pistas.
  - [ ] **Descarga**: Opción para descargar documentos desde el servidor, como comprobantes o normativas.
- [ ] **Importación y exportación de datos**: Funcionalidad en el panel de administrador para descargar (CSV/Excel) el listado de reservas y poder importar pistas masivamente.
- [ ] **Ficheros de Logs**: Configurar un sistema de logging en el servidor (ej. Logback) para registrar transacciones importantes y errores.
- [ ] **Integración con IA**: Conectar el backend con modelos de IA (ej. OpenAI) para procesar datos complejos o comunicarse con el chatbot y alimentar el sistema de reservas.

## 3. Diseño de Interfaces Web
*Maquetación y estilo visual (UI/UX).*
- [ ] **Prototipo y Guía de Estilos**: Documentar los colores, tipografías, estados de botones y componentes de la web.
- [ ] **Maquetación con Flexbox, Grid y BEM**: Construir los componentes (ej. listado de pistas) combinando Grid (para la estructura general) y Flexbox (para alinear contenidos interiores), usando la metodología BEM para nombrar clases si se usa CSS puro o SCSS.
- [ ] **Framework CSS y Efectos**: Utilizar Bootstrap o Tailwind e incorporar interactividad: transiciones al hacer hover en pistas, animaciones de carga, clip-paths decorativos.
- [ ] **Diseño Responsive**: Asegurar que la experiencia sea perfecta tanto en la aplicación web de escritorio, como en tablets y en el navegador del móvil.

## 4. Desarrollo de Agentes IA para Web
*Dotando de "inteligencia" a la app centralizadora.*
- [ ] **Chatbot Asistente (Interacción)**: Integrar un widget en la interfaz donde un agente de IA atienda al usuario, usando lenguaje natural, para ayudarle a encontrar pistas disponibles o resolver dudas.
- [ ] **Integración de Modelos IA**: Procesar el input del usuario en el chatbot usando APIs como OpenAI para extraer variables clave (fecha, hora, deporte buscado).
- [ ] **Automatización con n8n (Workflows)**: 
  - Crear un flujo en **n8n** que se dispare cuando el usuario o la IA solicitan una reserva. Este workflow se conectará automáticamente con la web/API del proveedor original de la pista, realizará la reserva en la plataforma externa en segundo plano y devolverá el estado del proceso a la PachangApp.

## 5. Itinerario Personal para la Empleabilidad II
*Viabilidad empresarial y modelo de negocio.*
- [ ] **Definición de Oportunidad de Negocio**: Documentar el modelo de negocio (ej. cómo monetiza: comisión por reserva, suscripción premium para buscar pista más rápido o publicidad de los clubes).
- [ ] **Estudio de Viabilidad**: Planificar presupuestos (gastos de servidores AWS, licencias, marketing) vs ingresos proyectados. Necesidades de financiación y recursos materiales/personales.
- [ ] **Obligaciones Fiscales/Laborales e Identificación de Ayudas**: Simular la puesta en marcha de la startup, decidiendo la forma jurídica (S.L., Autónomo), alta e impuestos, y explorando posibles ayudas como el Kit Digital u otras subvenciones tecnológicas.
- [ ] **Presentación y Pitch**: Preparar una exposición fluida y atractiva (pitch deck) del proyecto para el día de la presentación.

## 6. Desarrollo en Entorno Cliente
*El frontend interactivo (ej. Angular, React, Vue).*
- [ ] **Uso de un framework web SPA**: Montar la aplicación bajo el paradigma Single Page Application.
- [ ] **Enrutamiento (Routing)**: Implementar navegación fluida sin recarga de página (Home, Buscador, Pista, Login, Dashboard).
- [ ] **Reutilización de componentes**: Diseñar la interfaz basada en componentes modulares independientes (Cards de pistas, Modales de reserva, Filtros de búsqueda).
- [ ] **Consumo de APIs**: Integrarse al backend a través de peticiones asíncronas (Axios, Fetch, HttpClient) manejando correctamente estados de carga o errores.
- [ ] **Uso de Formularios Reactivos e Interactivos**: Formularios de login y búsqueda con validación en tiempo real.

## 7. Inglés
*Internacionalización y enfoque e-commerce en otros idiomas.*
- [ ] **Selector de Lenguaje (Internacionalización)**: Implementar i18n (ej. ngx-translate o react-i18next) para cambiar la web de Español a Inglés sin recargar.
- [ ] **Contenido Complejo en Inglés**: Traducir partes clave de la aplicación como los Términos y Condiciones, Políticas de Reserva y Cancelación (la parte legal del e-commerce), garantizando redacción adecuada.

## 8. Despliegue de Aplicaciones Web
*Llevar el proyecto a producción con buenas prácticas.*
- [ ] **Contenedores y Kubernetes**: Crear imágenes Docker (Dockerfiles) del Frontend, Backend, BBDD y n8n. Desplegar todos estos servicios usando clústeres de Kubernetes (manifiestos YAML).
- [ ] **Nube y Nombres de Dominio**: Desplegar el clúster en una nube (AWS, Azure, DigitalOcean o local tipo Minikube) usando un nombre de dominio (ej. `pachangapp.com`) en lugar de acceder por IPs.
- [ ] **Configuración de Servidores Web**: Configurar servidores como Ingress Controllers (Nginx/Traefik) dentro de Kubernetes para enrutar tráfico HTTP adecuadamente.
- [ ] **Protocolos Seguros (HTTPS)**: Implementar certificados SSL (ej. a través de Let's Encrypt / Cert-manager en Kubernetes).
- [ ] **CI/CD con GitHub Actions y SCV**:
  - Usar control de versiones integral en Git/GitHub.
  - Implementar pipelines automatizados que: al hacer push a `main`, corran los test de la app (unit tests), generen las imágenes Docker y actualicen el clúster Kubernetes.
- [ ] **Documentación automática de código**: Integrar Swagger/OpenAPI en el backend para tener la documentación de la API auto-generada, al igual que herramientas para documentar el código fuente (ej. Javadoc / TypeDoc).

---

## 🌟 Camino a la Excelencia (Ideas Extra)
Si te sobra tiempo y quieres asegurar la máxima calificación e impresionar en la defensa del proyecto, considera algunas de estas funciones avanzadas:

1. **"Matchmaking" y Pachangas Abiertas**: Si a un usuario le faltan jugadores para un partido, puede crear una "oferta" pública y la App notificará a otros usuarios de un nivel similar para que se sumen.
2. **Pagos Compartidos (Split Payments)**: Conectar una pasarela como Stripe para que cada persona del grupo pague su parte proporcional de la pista de forma automática, sin que uno tenga que adelantar el dinero.
3. **Agente Asistente Proactivo (IA)**: Que el chatbot no solo responda preguntas, sino que mande notificaciones usando el historial: *"Veo que sueles jugar al padel los martes. Queda una pista en tu club favorito hoy a las 18:00, ¿te la reservo rápidamente?"*.
4. **Sistema de Gamificación (Reputación)**: Un sistema de niveles o puntuación donde los usuarios se valoren entre ellos (puntualidad, deportividad), penalizando a aquellos que hacen "*no show*" (no presentarse a la partida).
5. **Observabilidad Avanzada**: Incluir métricas visuales del rendimiento de tus contenedores montando un panel en Grafana/Prometheus (es fácil añadir a Kubernetes) para demostrar nivel profesional de sistemas.
