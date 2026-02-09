¡Hola Ibrahim y Pablo! Me parece una idea fantástica. **PachangApp** tiene un nombre pegadizo y el concepto soluciona un problema real. Hacerlo en pareja y "fullstack" ambos es la mejor manera de aprender, aunque requiere mucha **organización**.

Al ser un TFG, la documentación y la metodología valen tanto como el código. Vamos a montar los cimientos de forma profesional desde el minuto uno.

Aquí tenéis la guía paso a paso para arrancar el proyecto hoy mismo.

---

### Fase 0: Organización y Herramientas (Antes de programar)

Antes de escribir una línea de código, necesitáis tener el entorno listo.

#### 1. Instalaciones Necesarias (En ambos ordenadores)

Aseguraos de tener esto instalado:

* **Node.js (LTS):** Para el frontend. Descargad la versión "LTS" (Long Term Support).
* **Python (3.10 o superior):** Para el backend.
* **Git:** Para el control de versiones.
* **VS Code:** Vuestro editor principal.

#### 2. Extensiones de VS Code

Para trabajar cómodos, instalad estas extensiones (buscadlas en la pestaña de extensiones a la izquierda):

* **Python** (de Microsoft).
* **ES7+ React/Redux/React-Native snippets:** Para escribir código React rápido.
* **Tailwind CSS IntelliSense:** Vital para que os autocomplete las clases.
* **Prettier - Code formatter:** Para que el código de Ibrahim y Pablo se vea idéntico automáticamente.
* **GitLens:** Ayuda a ver quién escribió qué (útil para no pisaros).
* *Nota sobre "Antigravity":* No estoy seguro si te refieres a un entorno específico o es una broma con la librería `import antigravity` de Python. Asumiré que usaréis VS Code estándar.

---

### Fase 1: Arquitectura del Proyecto (El Repositorio)

Para un TFG en pareja, os recomiendo un **Monorepo** (una sola carpeta que contenga todo). Es más fácil de gestionar en GitHub.

#### Estructura de carpetas objetivo:

```text
PachangApp/
├── backend/       (Python + SQL)
├── frontend/      (React + DaisyUI)
├── documentacion/ (Memorias, diagramas, Figma exports)
└── .gitignore

```

### Fase 2: Creación del Proyecto (Paso a Paso)

Abrid la terminal (puede ser la de VS Code o la del sistema) y seguid estos pasos.

#### Paso 1: Crear la carpeta raíz y Git

```bash
mkdir PachangApp
cd PachangApp
git init

```

#### Paso 2: Inicializar el Backend (Python)

Para el backend, usaremos **FastAPI**. Es moderno, rapidísimo, se lleva genial con React y genera la documentación automáticamente (algo que a los profesores les encanta).

1. Crear carpeta y entorno virtual:
```bash
mkdir backend
cd backend
python -m venv venv

```


2. Activar el entorno:
* **Windows:** `source venv/Scripts/activate`
* **Mac/Linux:** `source venv/bin/activate`
*(Deberíais ver `(venv)` al principio de la línea de comandos)*.


3. Instalar librerías base:
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-multipart

```


4. Guardar dependencias:
```bash
pip freeze > requirements.txt

```


5. Crear un archivo de prueba `main.py`:
```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "PachangApp API is working"}

```


6. Volved a la raíz: `cd ..`

#### Paso 3: Inicializar el Frontend (React + Vite)

Usaremos **Vite** en lugar de Create-React-App porque es mucho más rápido y moderno.

1. Crear el proyecto React:
```bash
npm create vite@latest frontend -- --template react

```


*(Si os pregunta, seleccionad Javascript + SWC o solo Javascript)*.
2. Entrar e instalar dependencias:
```bash
cd frontend
npm install

```


3. Instalar **Tailwind CSS** y **DaisyUI**:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install daisyui

```


4. Configurar Tailwind (`tailwind.config.js`):
Abrid este archivo en VS Code y cambiad `content` y añadid el plugin:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")], // Añadimos DaisyUI aquí
}

```


5. Añadir las directivas de Tailwind en `./src/index.css` (borrad todo lo que haya y pegad esto):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

```


6. Volved a la raíz: `cd ..`

#### Paso 4: El archivo .gitignore (¡Muy Importante!)

En la carpeta raíz `PachangApp`, cread un archivo llamado `.gitignore`. Esto evita que subáis archivos basura o gigantes a GitHub. Pegad esto dentro:

```text
# Python
backend/venv/
backend/__pycache__/
*.pyc

# Node
frontend/node_modules/
frontend/dist/

# System
.DS_Store
.env

```

---

### Fase 3: Flujo de Trabajo (Ibrahim y Pablo)

Como ambos tocaréis todo, no os dividáis por "Front/Back", dividíos por **Funcionalidad**.

**Ejemplo de reparto:**

* **Ibrahim:** Se encarga del "Login y Registro". Hace la base de datos de usuarios (Python), el endpoint de login (Python) y el formulario de login (React).
* **Pablo:** Se encarga de "Crear Partido". Hace la tabla de partidos (Python), el endpoint (Python) y la pantalla de crear partido (React).

**Cómo usar Git y GitHub:**

1. Cread un repositorio en GitHub llamado `PachangApp`.
2. Subid el código base que acabamos de crear:
```bash
git add .
git commit -m "Inicialización del proyecto: React + FastAPI"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/PachangApp.git
git push -u origin main

```


3. **Regla de oro:** Nunca trabajéis en la rama `main` directamente.
* Cuando Ibrahim empiece algo: `git checkout -b feature/login-ibrahim`
* Cuando Pablo empiece algo: `git checkout -b feature/partidos-pablo`
* Al terminar, hacéis un "Pull Request" en GitHub y el otro lo revisa antes de aceptar.



---

### Fase 4: Diseño y Figma (Antes de programar más)

Antes de seguir tirando código, parad y definid visualmente qué vais a hacer.

1. **Figma:** Cread un archivo compartido.
2. Diseñad primero en versión **Móvil** (Mobile First) aunque sea web. Tailwind facilita mucho que se adapte luego a escritorio.
3. Definid la **Guía de Estilos** (Colores de DaisyUI, tipografía). DaisyUI tiene temas predefinidos (light, dark, cupcake, bumblebee...), elegid uno para no perder tiempo diseñando botones desde cero.

---

### Resumen de Tecnologías Confirmadas

| Área | Tecnología | Notas |
| --- | --- | --- |
| **Frontend** | React + Vite + JS | Rápido y estándar. |
| **UI Kit** | Tailwind + DaisyUI | Componentes bonitos sin esfuerzo. |
| **Backend** | Python (FastAPI) | Ideal para APIs. |
| **Base de Datos** | PostgreSQL (Supabase/Neon) | SQL potente. Usad SQLite al principio localmente. |
| **Automatización** | n8n | Lo veremos más adelante (ej: mandar email al crear partido). |
| **Deploy** | Vercel (Front) + Render (Back) | GitHub Actions para unirlo todo. |

---

### ¿Cuál es el siguiente paso?

Ya tenéis la base instalada. Para poder guiaros en la **primera funcionalidad real**, necesito que me confirmes un par de cosas:

1. **Base de Datos:**  ¿Sabéis usar Docker? Si no, os recomiendo usar **SQLite** para empezar (es un archivo simple) y luego pasamos a PostgreSQL en la nube, para no complicaros la instalación ahora mismo.
2. **Antigravity:** ¿Qué es exactamente lo que mencionabas con "vs code y antigravity"? Necesito aclararlo para ver si afecta al entorno.
3. **Bot IA:** ¿Queréis que el bot sea un chatbot de soporte o algo que sugiera partidos?

**Siguiente tarea para vosotros:** Haced el `git push` inicial y pasadme las respuestas para deciros cómo configurar la base de datos SQL con Python.







git add .

git commit -m "Primera version: Estructura base conectada Front+Back" -m "Co-authored-by: Nombre Del Compañero <correo@ejemplo.com>"

git branch -M main

git remote add origin https://github.com/PachangApp/pachangapp-core.git

git push -u origin main