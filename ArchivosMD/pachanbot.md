# Guía Definitiva y Paso a Paso: Integración de PachanBot con n8n e IA

Este documento contiene las instrucciones precisas ("al milímetro") para montar el flujo de n8n que dará vida a tu PachanBot. La idea principal es que **n8n sirva de cerebro**: recibirá el mensaje del usuario, determinará qué quiere hacer y, si es necesario, usará Inteligencia Artificial para buscar partidos directamente en la base de datos o en la API de Spring Boot.

En el frontend (React), el bot mantiene su espíritu de "burbuja flotante" e incluye **3 botones rápidos** para guiar al usuario desde el primer momento.

---

## 1. Arquitectura General del Flujo

1.  **Frontend (React):** Manda un POST a n8n con un JSON que contiene:
    ```json
    {
      "action": "buscar_partido", 
      "message": "Quiero jugar mañana por la tarde en La Victoria"
    }
    ```
2.  **Webhook (n8n):** Recibe la solicitud y bloquea la respuesta hasta que el flujo termine.
3.  **Switch/Router:** Desvía el flujo según el campo `action`.
4.  **IA Agent (La Magia):** Si la acción es "buscar_partido", un agente de IA lee el `message`, usa una "herramienta" (Tool) para consultar tu API/Base de datos, y genera una respuesta natural.
5.  **Respond to Webhook:** Devuelve el texto final a React.

---

## 2. Creación del Flujo en n8n (Paso a Milímetro)

Abre n8n y crea un flujo nuevo ("Add Workflow"). Sigue estos pasos exactos:

### PASO A: El Gatillo (Webhook)
1. En el lienzo en blanco, haz clic en **+ Add first step**.
2. Busca y selecciona **Webhook**.
3. Configúralo así:
   - **Method:** `POST`
   - **Path:** `pachanbot-chat` (o el nombre que prefieras).
   - **Respond Mode:** `On 'Respond to Webhook' Node` *(CRÍTICO: Si no pones esto, n8n responderá "Workflow started" instantáneamente sin esperar a la IA).*
4. Cierra las propiedades del nodo. Copia la URL de **Test** (la necesitarás para React luego).

### PASO B: El Enrutador (Switch)
1. Arrastra el punto del nodo Webhook para añadir el siguiente nodo. Busca **Switch**.
2. En las propiedades del Switch:
   - **Mode:** `Rules` (Reglas).
   - **Value 1:** Haz clic en el engranaje/expresión y pon `{{ $json.body.action }}`.
3. Añade 3 "Routing Rules" (haciendo clic en `Add Routing Rule`):
   - **Regla 1:**
     - Data Type: `String`
     - Condition: `Equal`
     - Value: `buscar_partido`
     - Output: `0`
   - **Regla 2:**
     - Data Type: `String`
     - Condition: `Equal`
     - Value: `como_reservar`
     - Output: `1`
   - **Regla 3:**
     - Data Type: `String`
     - Condition: `Equal`
     - Value: `dudas`
     - Output: `2`

### PASO C: Respuestas Fijas (Rutas 1 y 2)
Para las preguntas frecuentes estándar, no gastaremos IA.
1. Desde la salida **1** del Switch (`como_reservar`), añade un nodo **Set** (o "Edit Fields").
   - **Field Name:** `responseText`
   - **String Value:** `Para reservar, ve a 'Crear Partido', selecciona tu campo, elige la hora libre y paga. Tienes 24h para cancelar sin penalización.`
2. Desde la salida **2** del Switch (`dudas`), añade otro nodo **Set**.
   - **Field Name:** `responseText`
   - **String Value:** `Nuestras instalaciones principales están en La Victoria y El Cónsul. Si tienes problemas técnicos, envía un correo a soporte@pachangapp.com.`

### PASO D: El Agente Inteligente (Ruta 0 - buscar_partido)
Esta es la parte vital donde la IA buscará en tu sistema.
1. Desde la salida **0** del Switch (`buscar_partido`), añade un nodo **AI Agent** (está en la categoría Advanced AI).
2. El nodo AI Agent necesita varios conectores:
   - **Chat Model:** Conecta un nodo `OpenAI Chat Model` (o el que prefieras). Pon tu clave API (ej. gpt-4o-mini).
   - **Memory:** Conecta un `Window Buffer Memory` para que recuerde el hilo de la charla (opcional pero recomendado si quieres que hagan preguntas encadenadas).
   - **Tools (Herramientas):** AQUÍ ESTÁ EL TRUCO. Conecta un nodo **HTTP Request Tool**.
3. **Configurar el HTTP Request Tool:**
   - **Name:** `buscar_partidos_api`
   - **Description:** `Usa esta herramienta SIEMPRE que el usuario te pida buscar partidos. Esta herramienta llama a la API de partidos.`
   - **Method:** `GET`
   - **URL:** `https://tudominio.com/api/partidos` (o la IP de tu Spring Boot). Puedes añadir parámetros de URL si tu backend los soporta, pero lo normal es que la IA consulte y luego filtre.
4. **Configurar el Prompt del AI Agent:**
   - En el propio nodo "AI Agent", ve a *Prompt / System Message* y escribe:
     > *"Eres PachanBot, el experto en encontrar partidos de PachangApp. El usuario te hará una petición consultando sobre un partido (ej: 'partidos para mañana'). OBLIGATORIAMENTE debes usar tu herramienta 'buscar_partidos_api' para obtener el listado real de la base de datos. Filtra mentalmente los partidos que coincidan con lo que pide el usuario (fecha, lugar u hora) y respóndele de forma amigable qué has encontrado. Usa emojis. No inventes partidos."*

### PASO E: Enviar la respuesta de vuelta a React
El último paso es devolver el texto al usuario.
1. En el lienzo, crea un nodo **Respond to Webhook** (búscalo y ponlo independiente).
2. Conecta las salidas de los tres caminos hacia este nodo único:
   - Conecta la salida de los dos nodos **Set** al "Respond to Webhook".
   - Conecta la salida del **AI Agent** al "Respond to Webhook".
3. En las propiedades del "Respond to Webhook":
   - **Respond With:** `JSON`
   - **Response Body:** `{"respuesta": "{{ $json.responseText || $json.output }}" }`
     *(Nota: Los nodos Set escupen `responseText`. El AI Agent suele escupir su texto en una propiedad llamada `output` o `text`. Revisa en n8n el nombre exacto del output de tu IA).*

---

## 3. Integración en el Frontend (Ya preparada)

El diseño del `ChatBot.jsx` ya lo hemos actualizado. Mantiene la burbuja flotante y, al abrirse, muestra al usuario 3 opciones inmediatas haciendo clic:
1. 🔍 Buscar partido libre
2. 🏟️ Cómo reservar pista
3. ❓ Otras dudas comunes

Cuando el usuario escriba texto libre o pulse un botón, llama a la función `processBotResponse()`. Actualmente simula un retraso de 1.5s. 

Para conectarlo a la realidad, **solo tendrás que cambiar `processBotResponse`** para que se vea así:

```javascript
  const processBotResponse = async (actionOrText) => {
    // Determinamos si es una acción directa de botón, o texto libre
    const isAction = ["buscar_partido", "como_reservar", "dudas"].includes(actionOrText);
    const payload = {
      action: isAction ? actionOrText : "buscar_partido", // Por defecto, si escribe, que la IA lo busque
      message: isAction ? "" : actionOrText
    };

    try {
      // Sustituye esta URL por tu Test URL o Production URL de n8n
      const response = await fetch('https://tu-n8n.com/webhook/pachanbot-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();

      const botResponse = { 
        id: Date.now() + 1, 
        text: data.respuesta, // Así lo hemos definido en el Respond to Webhook
        sender: "bot" 
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);

    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now(), text: "Problemas de red al contactar con la central.", sender: "bot" }]);
    }
  };
```

¡Listo! Con estos pasos, pasas de tener un simple menú de botones a tener a un agente de Inteligencia Artificial leyendo tu verdadera base de datos en Spring Boot y recomendando partidos a la carta.

---

## 4. Evolución de PachanBot: Memoria y Filtros Avanzados (Guía Detallada)

Si notas que el bot se repite o parece "tonto" (por ejemplo, te vuelve a saludar en cada mensaje en lugar de darte la respuesta), se debe a dos factores clave: **falta de memoria** para contextualizar la conversación y **fallos en la instrucción al buscar en la base de datos**. Sigue estos pasos para solucionarlo.

### 4.1. Añadir Memoria Correctamente (Window Buffer Memory)
Para que el bot mantenga una conversación fluida (ej: "Busca en la victoria" -> "Vale, ¿y para mañana?"), necesitas añadir memoria sin que dé error.

1. Borra el nodo "Simple Memory" si te estaba dando problemas.
2. Añade un nuevo conector al puerto "Memory" del **AI Agent**.
3. Selecciona **Window Buffer Memory**.
4. En las opciones de este nodo, busca el campo **Session ID**. Esto es VITAL.
5. Haz clic en el botón de expresión (engranaje) y escribe `sesion-pachangueo` (para pruebas locales). Si lo dejas vacío, el nodo fallará.
6. Ajusta el "Context Window Size" a `5`. Esto hará que la IA recuerde los últimos 5 mensajes, evitando que se sature.

### 4.2. El System Prompt Definitivo (Evitar bucles de saludo)
El problema de que repita el saludo principal se debe a que el prompt no es lo suficientemente estricto o no "ve" el historial bien. Cambia el *System Message* del nodo **AI Agent** exactamente por este:

> Eres PachanBot, un asistente resolutivo. 
> REGLAS CRÍTICAS:
> 1. NUNCA repitas tu saludo inicial "Hola, soy Pachanbot..." a menos que sea el primer mensaje. Estás en medio de una conversación. Ve directo al grano.
> 2. OBLIGATORIAMENTE DEBES usar la herramienta 'buscar_partidos_api' cuando el usuario pregunte por partidos (ej. fechas, lugares). No asumas información.
> 3. Una vez la herramienta te devuelva el JSON, filtra la información según lo que pidió el usuario (fecha, lugar u hora) y dale una respuesta natural. Si devuelve vacío `[]`, dile que no hay partidos.
> 4. El usuario te pregunta: {{ $json.chatInput }}

### 4.3. Configurar la Herramienta (HTTP Request Tool) al Milímetro
Para que la IA sepa usar tu backend, la herramienta debe estar perfectamente definida:

1. **Name:** `BuscarPartidos`
2. **Description (CRÍTICO):** `Llama a esta herramienta para consultar los partidos disponibles en la base de datos de Pachangapp. Úsala SIEMPRE que pregunten por partidos.`
3. **URL:** `http://host.docker.internal:8091/api/partidos`
4. **Method:** `GET`
5. **Funcionamiento Lógico:** Al hacer `GET /api/partidos`, tu Spring Boot devuelve un array de partidos. La IA (como Gemini/OpenAI) es capaz de ver ese JSON enorme y filtrar ella sola el que sea de "fuentenueva" o el que coincida con la fecha de "mañana".

### 4.4. Probar el Flujo Activo en Cadena
Para que el bot escuche múltiples mensajes seguidos sin cortarse:
1. En n8n, esquina superior derecha, cambia el interruptor a **Active** (o Published).
2. En tu código de React `ChatBot.jsx`, asegúrate de que la URL apunta a producción (quitando la palabra `test`):
   ```javascript
   const response = await fetch("http://localhost:5678/webhook/pachanbot-chat", { ... })
   ```
