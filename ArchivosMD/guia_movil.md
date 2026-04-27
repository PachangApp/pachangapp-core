# 📱 Guía de Desarrollo Móvil (Capacitor)

Esta guía te explica cómo trabajar en la versión móvil de PachangApp de forma paralela a la web.

## ⚙️ Configuración inicial (Para tu compañero)

Si acabas de hacer `git pull` de esta rama (`develop-android`), sigue estos pasos una sola vez para que todo funcione:

1.  **Instalar dependencias**: `cd frontend` y luego `npm install`.
2.  **Sincronizar móvil**: `npx cap sync android`.
3.  **Tener instalado**: [Android Studio](https://developer.android.com/studio) y el Java SDK (se instala con Android Studio).

---

1.  **Mueve tu terminal a la carpeta frontend**: `cd frontend`
2.  **Ejecuta el nuevo atajo**: `npm run mobile`

> [!TIP]
> Este comando hace internamente el `npm run build` y el `npx cap sync android` en un solo paso, ahorrándote tiempo.

---

## 2. Cómo verlo en Android Studio

Para abrir el proyecto nativo y poder lanzarlo en un emulador:

1.  Ejecuta: `npx cap open android` (esto abrirá Android Studio automáticamente).
2.  Espera a que termine de indexar (barra de progreso abajo a la derecha).
3.  Pulsa el botón **Play (Triángulo verde)** en la barra superior.

---

## 3. Cómo probar en tu Teléfono Físico

Para ver PachangApp en tu propio móvil sigue estos pasos:

1.  **Habilitar Modo Desarrollador**: Ve a Ajustes > Información del teléfono > Pulsa 7 veces sobre "Número de compilación".
2.  **Activar Depuración USB**: Dentro de Ajustes > Opciones de desarrollador, activa "Depuración por USB".
3.  **Conectar**: Conecta el móvil al PC mediante cable USB.
4.  **Lanzar**:
    - En Android Studio, en la lista desplegable de dispositivos junto al botón Play, debería aparecer tu modelo de móvil.
    - Selecciónalo y pulsa **Play**.

---

## 4. Desarrollo en paralelo

- **Diseño**: Asegúrate de que tus componentes de DaisyUI usen clases responsive (ej. `md:flex-row flex-col`).
### Frontend
- **Detección Automática de Entorno**: Se ha automatizado `apiConfig.js` para que detecte si la App corre en un móvil (usa la IP `192.168.18.156`) o en la web (usa `localhost`). **Ya no hace falta comentar/descomentar líneas**.
- **Navbar Responsive**: Se ha rediseñado el `Navbar.jsx` para incluir un menú de "hamburguesa" en móviles y tablets (breakpoint `md`).
- **Nuevas Funciones**: Cuando añadas una página nueva en React, simplemente haz el **Sync** (paso 1) y Android Studio detectará los cambios automáticamente sin necesidad de cerrar el emulador.
