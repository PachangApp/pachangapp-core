# Guía Definitiva: PachanBot con IA Formateadora 🤖✨

Esta es la mejor opción: usamos tu API `/search` para obtener los datos 100% reales, y luego le pasamos esos datos a la IA para que redacte un mensaje súper profesional, humano y con emojis. 

## 1. El Camino (Path 0)
Tienes que borrar los nodos actuales de la rama 0 y dejar el camino exactamente así:

`Switch` (Ruta 0) ➡️ `HTTP Request` ➡️ `AI Agent` ➡️ `Edit Fields` ➡️ `Respond to Webhook`

---

## 2. Nodo 1: HTTP Request (Obtener datos reales)
Conecta la ruta 0 del Switch a este nodo.
*   **Method:** `GET`
*   **URL:** `https://api.pachangapp.es/api/partidos/search`
*   **Authentication:** None (asumiendo que es pública).
*   *Nota:* Al hacer "Test step" aquí, debes ver tu array limpio con el Campus Cartuja, etc.

---

## 3. Nodo 2: AI Agent (El Traductor Mágico)
Conecta el HTTP Request a un nuevo nodo **AI Agent**. Asegúrate de conectarle debajo su **Chat Model** (Groq) y su **Memory**.

Dentro de la configuración del **AI Agent**:
*   **Agent Type:** `Conversational Agent` (o el estándar que estés usando).
*   **System Message** (ESTO ES LA CLAVE, cópialo tal cual):
    ```text
    Eres PachanBot, el asistente amigable de PachangApp. 
    A continuación recibirás una lista de partidos de fútbol en formato JSON.
    TU ÚNICA TAREA es leer esos datos y redactar un mensaje amigable, humano y motivador para el usuario.
    Usa emojis. Menciona el deporte, el lugar, la fecha, la hora, el precio y las plazas libres.
    Si recibes varios partidos, lístalos de forma elegante.
    NUNCA, BAJO NINGÚN CONCEPTO, respondas con código JSON. Solo texto.
    Al final del mensaje, anima al usuario a ir a la sección 'Explorar' de la aplicación para unirse.
    Si el JSON está vacío, dile con amabilidad que no hay partidos disponibles ahora mismo.
    ```
*   **Prompt / User Message** (Lo que le enviamos a la IA):
    Aquí tienes que arrastrar el *Output* del nodo HTTP Request, para que quede algo como esto:
    `Aquí tienes los partidos encontrados: {{ $json }}`

---

## 4. Nodo 3: Edit Fields (Preparar la respuesta)
El ChatBot en tu código React (`ChatBot.jsx`) está esperando recibir un JSON que tenga esta estructura exacta: `{"respuesta": "texto del bot"}`. Pero el AI Agent devuelve su texto en un campo que suele llamarse `output` o `text`.

1. Añade un nodo **Edit Fields** (Set) después del AI Agent.
2. Añade un nuevo campo (String).
3. **Name:** `respuesta`
4. **Value:** Arrastra aquí el resultado del AI Agent (suele ser `{{ $json.output }}` o `{{ $json.text }}`).

---

## 5. Nodo 4: Respond to Webhook (Enviar a la App)
Conecta el Edit Fields a este nodo.
*   **Respond With:** `First Incoming Item` (o JSON).
*   Al hacerlo así, le estará enviando a la app exactamente lo que acabamos de crear: `{"respuesta": "¡Hola! He encontrado estos partidazos..."}`.

---

### Resumen visual de la magia:
1. El usuario pide buscar partido.
2. n8n va a tu base de datos y saca el JSON feo.
3. n8n le da ese JSON a la IA y le dice: "Traduce esto a humano".
4. La IA escribe un mensaje precioso.
5. Se lo enviamos al usuario al frontend. 

¡Haz la prueba y verás qué salto de calidad!
