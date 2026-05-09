# Plan de Expansión - PachangApp Plus 🚀

Este documento detalla las próximas 3 fases de desarrollo para añadir funcionalidades sociales y de gamificación a la plataforma.

---

## 📋 TAREA 1: Sistema de Búsqueda de Jugadores y Perfiles Públicos

**Objetivo:** Permitir que los usuarios encuentren compañeros de equipo según su posición y consulten su nivel sin exponer datos privados.

### 🤖 Prompt para la IA:
> "Implementa una nueva página de 'Buscar Jugadores' en el frontend y los endpoints necesarios en el backend (Spring Boot). 
> 
> **Requisitos Técnicos:**
> 1. **Backend:** Crea un endpoint `GET /api/usuarios/buscar` que permita filtrar por posición. La lógica debe incluir a un usuario en los resultados si la posición buscada coincide con cualquiera de sus 3 preferencias guardadas (`posicion1`, `posicion2`, `posicion3`).
> 2. **Frontend:** Crea `BuscarJugadores.jsx`. Debe incluir:
>    - Un sistema de filtros visual por posición (Portero, Defensa, etc.) usando los componentes `Dropdown` existentes.
>    - Una cuadrícula de 'PlayerCards' que muestre: Imagen de perfil, Nombre, Posición principal y Ranking (Nivel).
> 3. **Vista de Perfil Simplificado:** Implementa un modal o una página de 'Perfil Público' que se abra al hacer clic en un jugador. Solo debe mostrar: Nombre, Foto, Estadísticas reales (Partidos, Victorias, Derrotas) y sus 3 posiciones preferidas. **No mostrar datos personales** como email o teléfono.
> 4. **Integración:** Asegura que la página respete el Modo Noche (variables CSS de `index.css`) y use `i18next` para todas las etiquetas. Añade el enlace en el `Navbar`."

---

## 📋 TAREA 2: Sistema de Amigos e Invitaciones Directas

**Objetivo:** Fomentar la comunidad permitiendo conexiones directas y agilizando el llenado de partidos.

### 🤖 Prompt para la IA:
> "Implementa un sistema de 'Amigos' y una funcionalidad de 'Invitar a Partido'.
> 
> **Requisitos Técnicos:**
> 1. **Modelo de Datos:** Crea una entidad `Amistad` en el backend para gestionar relaciones entre usuarios (Pendiente, Aceptada).
> 2. **Gestión de Amigos:** 
>    - En el perfil del usuario, añade una pestaña de 'Mis Amigos'.
>    - En la búsqueda de jugadores (Tarea 1), añade un botón de 'Agregar Amigo'.
> 3. **Invitaciones:** 
>    - En la página de detalles de un partido, si el usuario es el organizador, añade un botón 'Invitar Amigos'.
>    - Al pulsar, debe abrir un modal con la lista de amigos y un botón 'Enviar Invitación'.
>    - La invitación debe generar una notificación o aparecer en la sección 'Mis Próximos Partidos' del amigo invitado como una invitación pendiente.
> 4. **Interfaz:** Usa `framer-motion` para las transiciones de los modales y asegura la compatibilidad total con el Modo Noche."

---

## 📋 TAREA 3: Sistema de Logros y Vitrina de Insignias

**Objetivo:** Gamificar la experiencia premiando la actividad y el éxito de los jugadores.

### 🤖 Prompt para la IA:
> "Implementa un sistema de 'Logros e Insignias' (Badges) basado en hitos del jugador.
> 
> **Requisitos Técnicos:**
> 1. **Lógica de Logros:** Crea un servicio en el backend que verifique hitos al finalizar un partido:
>    - 'Primer Paso': Por jugar el primer partido.
>    - 'Veterano': Por jugar 10, 50 o 100 partidos.
>    - 'Ganador Nato': Por una racha de 3 victorias seguidas.
>    - 'Imbatible': Por ganar 10 partidos en total.
> 2. **Vitrina en Perfil:** 
>    - En `Perfil.jsx`, añade una sección 'Mis Logros'.
>    - Las insignias bloqueadas deben aparecer en gris y las conseguidas en color.
> 3. **Insignia Destacada:** 
>    - Permite que el usuario seleccione una de sus insignias conseguidas como 'Favorita'.
>    - Esta insignia elegida debe aparecer junto a su nombre en la `MatchCard` de los partidos y en su Perfil Público (Tarea 1).
> 4. **Estética:** Crea diseños modernos para las insignias usando iconos de Font Awesome o SVGs circulares con degradados premium. Asegura que brillen y resalten especialmente en el Modo Noche."
