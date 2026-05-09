# 🤖 Guía Completa: PachanBot — Workflow n8n + ChatBot.jsx

> **Objetivo**: El bot saluda con "Hola soy PachanBot" y ofrece 3 opciones:
> 1. 🏟️ ¿Cómo reservo pista? → Respuesta predefinida (sin IA)
> 2. ⚽ ¿Cómo me uno a un partido? → Respuesta predefinida (sin IA)
> 3. 🔍 Buscar partido libre → Usa IA para consultar la API y mostrar partidos reales

---

## PARTE 1: Modificar `ChatBot.jsx`

> IMPORTANTE: Primero modifica el fichero del frontend. Luego configura n8n.

### Archivo: `frontend/src/components/ChatBot.jsx`

Cambia las opciones iniciales y la función `processBotResponse`. Los cambios clave son:

| Qué cambió | Antes | Ahora |
|---|---|---|
| Opción 1 | `🏟️ Cómo reservar pista` / `como_reservar` | `🏟️ ¿Cómo reservo pista?` / `como_reservar` |
| Opción 2 | `❓ Otras dudas comunes` / `dudas` | `⚽ ¿Cómo me uno a un partido?` / `como_unirse` |
| Opción 3 | `🔍 Buscar partido libre` / `buscar_partido` | (sin cambios) |
| Action del Switch | `dudas` | `como_unirse` |
| URL de n8n | Hardcoded inline | Variable `N8N_WEBHOOK_URL` (más fácil de cambiar) |

El código completo del componente se aplicará por separado (ver sección de implementación).

---

## PARTE 2: Configurar el Workflow en n8n (Nodo por Nodo)

> IMPORTANTE: Sigue estos pasos en el mismo orden que aparecen. Cada nodo se describe con los campos exactos que debes rellenar.

Estructura del workflow:

```
Webhook → Switch → (3 ramas)
  ├── Rama 0 (buscar_partido): AI Agent → HTTP Request → Aggregate → AI Agent1 → Respond to Webhook
  ├── Rama 1 (como_reservar):  Edit Fields → Respond to Webhook
  └── Rama 2 (como_unirse):    Edit Fields1 → Respond to Webhook
```

---

### NODO 1: Webhook

Es el punto de entrada. Recibe el POST del frontend.

| Campo | Valor exacto |
|---|---|
| **HTTP Method** | `POST` |
| **Path** | `pachanbot-chat` |
| **Respond** | `Using 'Respond to Webhook' Node` |

> ⚠️ CUIDADO: Si pones "Immediately" en vez de "Using Respond to Webhook Node", el bot responderá al instante "Workflow was started" sin esperar a la IA. SIEMPRE pon "Using 'Respond to Webhook' Node".

---

### NODO 2: Switch (mode: Rules)

Lee el campo `action` del JSON que envía React y redirige a la rama correcta.

| Campo | Valor exacto |
|---|---|
| **Mode** | `Rules` |
| **Routing Rules** | 3 reglas (ver abajo) |

**Regla 0** (Salida 0 → hacia AI Agent):

| Campo | Valor |
|---|---|
| Value 1 | `{{ $json.body.action }}` |
| Operation | `Equals` |
| Value 2 | `buscar_partido` |

**Regla 1** (Salida 1 → hacia Edit Fields):

| Campo | Valor |
|---|---|
| Value 1 | `{{ $json.body.action }}` |
| Operation | `Equals` |
| Value 2 | `como_reservar` |

**Regla 2** (Salida 2 → hacia Edit Fields1):

| Campo | Valor |
|---|---|
| Value 1 | `{{ $json.body.action }}` |
| Operation | `Equals` |
| Value 2 | `como_unirse` |

---

### NODO 3: Edit Fields (Respuesta predefinida — "¿Cómo reservo pista?")

Conecta la **Salida 1** del Switch a este nodo.

| Campo | Valor exacto |
|---|---|
| **Mode** | `Manual Mapping` |
| **Field Name** | `respuesta` |
| **Type** | `String` |
| **Value** | (ver texto abajo) |

**Texto a poner en Value:**

```
🏟️ ¡Reservar pista es muy fácil!

1️⃣ Entra en "Crear Partido" desde el menú principal
2️⃣ Selecciona el campo deportivo que prefieras
3️⃣ Elige la fecha y la hora que esté libre (las ocupadas aparecen en gris)
4️⃣ Indica el número máximo de jugadores
5️⃣ Confirma y ¡listo! Tu pista queda reservada ✅

Los demás jugadores podrán unirse desde "Buscar Partidos". ¡A disfrutar! ⚽
```

---

### NODO 4: Edit Fields1 (Respuesta predefinida — "¿Cómo me uno a un partido?")

Conecta la **Salida 2** del Switch a este nodo.

| Campo | Valor exacto |
|---|---|
| **Mode** | `Manual Mapping` |
| **Field Name** | `respuesta` |
| **Type** | `String` |
| **Value** | (ver texto abajo) |

**Texto a poner en Value:**

```
⚽ ¡Unirte a un partido es súper sencillo!

1️⃣ Ve a "Buscar Partidos" en el menú principal
2️⃣ Verás todos los partidos abiertos con plazas libres
3️⃣ Puedes filtrar por lugar o fecha para encontrar el que más te guste
4️⃣ Pulsa en el partido que te interese para ver los detalles
5️⃣ Dale a "Unirme" y ya estás dentro 🎉

Una vez dentro, podrás ver a los demás jugadores y elegir tu equipo (blanco o negro). ¡Nos vemos en la cancha! 🏃‍♂️
```

---

### NODO 5: AI Agent (primer agente — consulta con Gemini)

Conecta la **Salida 0** del Switch (buscar_partido) a este nodo.

| Campo | Valor exacto |
|---|---|
| **Type** | `Tools Agent` |
| **Text / Prompt** | `{{ $json.body.chatInput }}` |
| **System Message** | (ver texto abajo) |

**System Message (copia tal cual):**

```
Eres PachanBot, el asistente experto de PachangApp para encontrar partidos de fútbol.

REGLAS CRÍTICAS:
1. NUNCA repitas tu saludo inicial. Estás en medio de una conversación. Ve directo al grano.
2. OBLIGATORIAMENTE debes usar la herramienta 'buscar_partidos_api' para obtener el listado real de partidos.
3. Una vez la herramienta te devuelva el JSON, filtra la información según lo que pidió el usuario (fecha, lugar u hora).
4. Muestra los resultados de forma clara y amigable con emojis.
5. Si no hay partidos disponibles, dile amablemente que no hay partidos y sugiérele crear uno nuevo.
6. NO inventes partidos. Solo muestra los que devuelva la herramienta.
7. Responde siempre en español.
```

#### Sub-nodo: Google Gemini Chat Model1 (conectar al puerto "Chat Model"):

| Campo | Valor |
|---|---|
| **Credential** | Tu credencial de Google Gemini (API Key) |
| **Model** | `gemini-2.0-flash` (o el que tengas disponible) |

#### Sub-nodo: Simple Memory (conectar al puerto "Memory"):

| Campo | Valor |
|---|---|
| **Session ID** | `{{ $json.body.sessionId }}` |
| **Context Window Length** | `5` |

> NOTA: El sessionId viene del frontend ("sesion-pachangueo"). Así n8n recuerda los últimos mensajes del usuario.

#### Sub-nodo: HTTP Request Tool (conectar al puerto "Tool"):

| Campo | Valor exacto |
|---|---|
| **Name** | `buscar_partidos_api` |
| **Description** | `Llama a esta herramienta para consultar los partidos disponibles en la base de datos de PachangApp. Úsala SIEMPRE que pregunten por partidos disponibles, libres, abiertos o por jugar.` |
| **Method** | `GET` |
| **URL** | `http://host.docker.internal:8091/api/partidos/search` |

> IMPORTANTE: La URL usa `host.docker.internal` porque n8n corre dentro de Docker/Kubernetes y necesita acceder al Spring Boot que corre en el host. Si n8n y el backend están en el mismo cluster de Kubernetes, puedes usar `http://backend-service:8091/api/partidos/search`.

---

### NODO 6: Aggregate

Este nodo **agrupa** los resultados que vienen del HTTP Request Tool para pasarlos como un solo bloque al siguiente agente de IA.

| Campo | Valor |
|---|---|
| **Aggregate** | `All Item Data (Into a Single List)` |
| **Put Output in Field** | `data` |

> NOTA: Este nodo existe porque el HTTP Request Tool puede devolver múltiples items (uno por partido). El Aggregate los junta en un solo JSON para que el segundo AI Agent los pueda leer todos de golpe.

---

### NODO 7: AI Agent1 (segundo agente — formato final con Ollama)

Este agente recibe los datos agregados y genera la respuesta final bonita para el usuario.

| Campo | Valor exacto |
|---|---|
| **Type** | `Tools Agent` |
| **Text / Prompt** | `Formatea estos partidos para el usuario de forma amigable: {{ $json.data }}` |
| **System Message** | (ver texto abajo) |

**System Message:**

```
Eres PachanBot. Te doy una lista de partidos en formato JSON.
Tu tarea es presentarlos de forma clara y amigable al usuario.
Para cada partido muestra:
- 📍 Lugar (campo "lugar")
- 📅 Fecha
- ⏰ Hora
- 🏃 Plazas libres
- 💰 Precio por hora
Si la lista está vacía, dile que no hay partidos disponibles y sugiérele crear uno nuevo.
Responde siempre en español con emojis.
```

#### Sub-nodo: Ollama Chat Model1 (conectar al puerto "Chat Model"):

| Campo | Valor |
|---|---|
| **Base URL** | `http://host.docker.internal:11434` |
| **Model** | El modelo que tengas instalado en Ollama (ej: `llama3`, `mistral`, etc.) |

> TIP: Si no tienes Ollama instalado o prefieres usar solo Gemini, puedes conectar otro nodo Google Gemini Chat Model aquí en lugar de Ollama. Funciona exactamente igual.

#### Sub-nodo: Simple Memory1 (conectar al puerto "Memory"):

| Campo | Valor |
|---|---|
| **Session ID** | `sesion-formato` |
| **Context Window Length** | `3` |

---

### NODO 8: Respond to Webhook

Este es el **último nodo**. Las 3 ramas (Edit Fields, Edit Fields1 y AI Agent1) deben conectarse aquí.

| Campo | Valor exacto |
|---|---|
| **Respond With** | `JSON` |
| **Response Body** | (ver abajo) |

**Response Body (campo de expresión):**

```json
{
  "respuesta": "{{ $json.respuesta || $json.output || $json.text || 'No pude procesar tu solicitud' }}"
}
```

> IMPORTANTE:
> - Los nodos Edit Fields y Edit Fields1 devuelven el campo `respuesta` (lo definimos nosotros).
> - El nodo AI Agent1 devuelve el campo `output` (lo genera n8n automáticamente).
> - El `||` asegura que siempre haya un texto, sea cual sea la rama que llegue.

---

## PARTE 3: Conexiones entre nodos (Resumen visual)

```
                                    ┌─ Edit Fields ──────────────────────┐
                                    │  (como_reservar)                   │
                                    │                                    │
Webhook ──► Switch ─── Salida 1 ────┘                                    │
              │                                                          ├──► Respond to Webhook
              ├─────── Salida 2 ────┐                                    │
              │                     │                                    │
              │                     └─ Edit Fields1 ─────────────────────┤
              │                        (como_unirse)                     │
              │                                                          │
              └─────── Salida 0 ────► AI Agent ──► HTTP Request (Tool)   │
                       (buscar)         │              │                  │
                                        │              ▼                  │
                                        │           Aggregate            │
                                        │              │                  │
                                        │              ▼                  │
                                        │          AI Agent1 ────────────┘
                                        │
                                    (Sub-nodos del AI Agent):
                                    ├── Google Gemini Chat Model1
                                    ├── Simple Memory
                                    └── HTTP Request Tool
                                    
                                    (Sub-nodos del AI Agent1):
                                    ├── Ollama Chat Model1
                                    └── Simple Memory1
```

---

## PARTE 4: Probar el flujo

### Paso 1 — Prueba en modo Test (local)
1. En n8n, asegúrate de que el workflow está en modo **Test** (no activo).
2. La URL del webhook en modo test es:
   ```
   http://localhost:5678/webhook-test/pachanbot-chat
   ```
3. Asegúrate de que en `ChatBot.jsx` la variable `N8N_WEBHOOK_URL` apunta a esa URL.
4. Arranca tu backend Spring Boot (`mvn spring-boot:run`).
5. Arranca tu frontend (`npm run dev`).
6. Abre el chat, pulsa una opción y comprueba que funciona.

### Paso 2 — Activar en producción
1. En n8n, pulsa el botón **Active/Publish** (esquina superior derecha).
2. La URL de producción cambia (se quita `-test`):
   ```
   http://localhost:5678/webhook/pachanbot-chat
   ```
3. Si n8n está en Kubernetes (tu servidor AWS), la URL será:
   ```
   http://<IP_DEL_SERVIDOR>:30678/webhook/pachanbot-chat
   ```
4. Actualiza `N8N_WEBHOOK_URL` en el `ChatBot.jsx` con la URL de producción.

---

## PARTE 5: Checklist final

- [ ] `ChatBot.jsx` actualizado con las 3 opciones nuevas
- [ ] Webhook creado con method POST y path `pachanbot-chat`
- [ ] Webhook configurado con "Respond to Webhook Node" (NO "Immediately")
- [ ] Switch configurado con 3 reglas: `buscar_partido`, `como_reservar`, `como_unirse`
- [ ] Edit Fields con el texto de "cómo reservar pista"
- [ ] Edit Fields1 con el texto de "cómo unirse a un partido"
- [ ] AI Agent con Google Gemini, Simple Memory y HTTP Request Tool
- [ ] HTTP Request Tool apuntando a `http://host.docker.internal:8091/api/partidos/search`
- [ ] Aggregate configurado
- [ ] AI Agent1 con Ollama (o Gemini) y Simple Memory1
- [ ] Respond to Webhook con el JSON `{ "respuesta": "..." }`
- [ ] Todas las ramas conectadas al Respond to Webhook
- [ ] Probado en modo Test
- [ ] Activado en producción

---

> TIP: Si algo no funciona, en n8n puedes ver la ejecución paso a paso pulsando en "Executions" (icono de reloj). Ahí verás qué nodo falló y qué datos recibió/envió.
