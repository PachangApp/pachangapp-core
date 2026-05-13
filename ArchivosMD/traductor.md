# 🌐 Traductor IA — Chat en Tiempo Real con n8n + Groq

Guía paso a paso para implementar la traducción automática de mensajes del chat usando **n8n** como orquestador y **Groq** (Llama 3) como motor de traducción.

---

## Arquitectura del Flujo

```
[Usuario pulsa "Traducir"]
       │
       ▼
[POST /webhook/translate]  ─── { text, targetLang }
       │
       ▼
[n8n: Webhook Trigger]
       │
       ▼
[n8n: Groq LLM]  ─── System: "Traduce al {targetLang}"
       │                User: "{text}"
       ▼
[n8n: Respond to Webhook]  ─── { translatedText: "..." }
       │
       ▼
[Frontend muestra traducción debajo del mensaje]
```

---

## PARTE 1: Configurar el Flujo en n8n

### Paso 1.1 — Crear las credenciales de Groq

1. Ve a tu panel de n8n → **Settings** → **Credentials** → **Add Credential**.
2. Busca **"Groq"** (o **"HTTP Header Auth"** si Groq no aparece como nodo nativo).
3. Configura:
   - **API Key**: Tu clave de Groq (la sacas de [console.groq.com/keys](https://console.groq.com/keys)).
   - **Nombre**: `Groq API Key`

### Paso 1.2 — Crear el Workflow

1. En n8n, crea un **New Workflow** y ponle de nombre: `PachangApp - Traductor Chat`.

### Paso 1.3 — Nodo 1: Webhook (Trigger)

1. Añade un nodo **Webhook**.
2. Configuración:

| Campo           | Valor                        |
|-----------------|------------------------------|
| **HTTP Method** | `POST`                       |
| **Path**        | `translate`                  |
| **Authentication** | `None` (o Header Auth si quieres securizarlo) |
| **Response Mode** | `Last Node`               |

> **IMPORTANTE:** Apunta la **Production URL** que te genera n8n. Será algo como:
> `https://tu-n8n.com/webhook/translate`
> Esta URL es la que usarás en el frontend.

### Paso 1.4 — Nodo 2: Groq Chat Model

Hay dos formas de hacerlo dependiendo de tu versión de n8n:

#### Opción A: Nodo nativo de Groq (si lo tienes disponible)

1. Añade un nodo **Groq Chat Model**.
2. Configuración:

| Campo             | Valor                          |
|-------------------|--------------------------------|
| **Credential**    | `Groq API Key` (la que creaste) |
| **Model**         | `llama-3.1-8b-instant`        |
| **Temperature**   | `0.1` (queremos precisión, no creatividad) |

#### Opción B: Nodo HTTP Request (alternativa universal)

Si no tienes el nodo nativo de Groq, usa un **HTTP Request**:

| Campo             | Valor                          |
|-------------------|--------------------------------|
| **Method**        | `POST`                         |
| **URL**           | `https://api.groq.com/openai/v1/chat/completions` |
| **Authentication**| `Generic Credential Type` → `Header Auth` |
| **Header Name**   | `Authorization`                |
| **Header Value**  | `Bearer TU_API_KEY_GROQ`      |
| **Body Content Type** | `JSON`                    |
| **Body**          | (ver abajo)                    |

```json
{
  "model": "llama-3.1-8b-instant",
  "temperature": 0.1,
  "max_tokens": 500,
  "messages": [
    {
      "role": "system",
      "content": "Eres un traductor experto. Tu ÚNICA tarea es traducir el texto del usuario al idioma indicado. Mantén el tono informal y futbolero. Devuelve SOLO el texto traducido, sin explicaciones, sin comillas, sin prefijos."
    },
    {
      "role": "user",
      "content": "Traduce el siguiente texto al {{ $json.body.targetLang }}: {{ $json.body.text }}"
    }
  ]
}
```

### Paso 1.5 — Nodo 3: AI Agent / Basic LLM Chain (Opción A)

Si usaste la **Opción A** (nodo nativo Groq), necesitas conectarlo a un nodo que procese el prompt:

1. Añade un nodo **Basic LLM Chain** (o **AI Agent**).
2. Configuración:

| Campo              | Valor                        |
|--------------------|------------------------------|
| **Prompt**         | `Traduce el siguiente texto al {{ $json.body.targetLang }}: {{ $json.body.text }}` |
| **System Message** | `Eres un traductor experto. Tu ÚNICA tarea es traducir el texto del usuario al idioma indicado. Mantén el tono informal y futbolero. Devuelve SOLO el texto traducido, sin explicaciones, sin comillas, sin prefijos.` |

3. Conecta el **Groq Chat Model** como sub-nodo del **Basic LLM Chain** (arrastra desde la conexión "Model" del LLM Chain).

### Paso 1.6 — Nodo 4: Respond to Webhook

1. Añade un nodo **Respond to Webhook**.
2. Configuración:

| Campo              | Valor                        |
|--------------------|------------------------------|
| **Respond With**   | `JSON`                       |
| **Response Body**  | (ver abajo)                  |

Para **Opción A** (Basic LLM Chain):
```json
{
  "translatedText": "{{ $json.text }}"
}
```

Para **Opción B** (HTTP Request):
```json
{
  "translatedText": "{{ $json.choices[0].message.content }}"
}
```

### Paso 1.7 — Conexiones del Workflow

```
[Webhook] → [Basic LLM Chain + Groq Model] → [Respond to Webhook]
```

o bien:

```
[Webhook] → [HTTP Request (Groq API)] → [Respond to Webhook]
```

### Paso 1.8 — Activar el Workflow

1. Pulsa el botón **"Active"** (toggle arriba a la derecha).
2. Prueba enviando una petición manual con Postman o `curl`:

```bash
curl -X POST https://tu-n8n.com/webhook/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Vamos equipo, hoy ganamos seguro!", "targetLang": "English"}'
```

Deberías recibir algo como:
```json
{
  "translatedText": "Let's go team, we're definitely winning today!"
}
```

---

## PARTE 2: Cambios en el Frontend

### Paso 2.1 — Añadir la URL del Webhook en apiConfig.js

Abre `frontend/src/apiConfig.js` y añade al final:

```javascript
// URL del webhook de traducción en n8n
export const N8N_TRANSLATE_URL = isProduction
  ? 'https://tu-n8n-produccion.com/webhook/translate'
  : 'https://tu-n8n-produccion.com/webhook/translate';  // Misma URL si n8n está en la nube
```

> **NOTA:** Si tu n8n está en la misma máquina en local, usa `http://localhost:5678/webhook/translate`.
> Si está desplegado, usa la URL pública.

### Paso 2.2 — Añadir claves de traducción

#### En `frontend/src/locales/es.json` — Dentro del bloque de `tournaments.chat`:

```json
"chat": {
  "live_chat": "Live Chat",
  "online": "ONLINE",
  "cheer_team": "Anima a tu equipo...",
  "translate": "Traducir",
  "translated_by_ai": "Traducido por IA",
  "translating": "Traduciendo...",
  "translate_error": "Error al traducir"
}
```

#### En `frontend/src/locales/en.json` — Dentro del bloque de `tournaments.chat`:

```json
"chat": {
  "live_chat": "Live Chat",
  "online": "ONLINE",
  "cheer_team": "Cheer your team...",
  "translate": "Translate",
  "translated_by_ai": "Translated by AI",
  "translating": "Translating...",
  "translate_error": "Translation error"
}
```

#### En `frontend/src/locales/es.json` — Añade un nuevo bloque `match_chat`:

```json
"match_chat": {
  "title": "Chat del Partido 💬",
  "placeholder": "Escribe un mensaje...",
  "translate": "Traducir",
  "translated_by_ai": "Traducido por IA",
  "translating": "Traduciendo...",
  "translate_error": "Error al traducir"
}
```

#### En `frontend/src/locales/en.json` — Añade el mismo bloque `match_chat`:

```json
"match_chat": {
  "title": "Match Chat 💬",
  "placeholder": "Write a message...",
  "translate": "Translate",
  "translated_by_ai": "Translated by AI",
  "translating": "Translating...",
  "translate_error": "Translation error"
}
```

### Paso 2.3 — Modificar TournamentChat.jsx

Abre `frontend/src/components/TournamentChat.jsx`.

#### 2.3.1 — Añadir imports y estado

Después de la línea 4 (`import { API_BASE_URL } from '../apiConfig';`), añade:

```javascript
import { N8N_TRANSLATE_URL } from '../apiConfig';
```

Dentro del componente, después de la línea `const [inputVal, setInputVal] = useState("");` (línea 9), añade:

```javascript
const [translations, setTranslations] = useState({});  // { messageId: "texto traducido" }
const [translating, setTranslating] = useState({});     // { messageId: true/false }
```

#### 2.3.2 — Añadir la función de traducción

Después de `handleSend` (tras la línea 70), añade esta función:

```javascript
const handleTranslate = async (messageId, originalText) => {
  // Si ya está traducido, ocultamos la traducción (toggle)
  if (translations[messageId]) {
    setTranslations(prev => {
      const copy = { ...prev };
      delete copy[messageId];
      return copy;
    });
    return;
  }

  // Detectar el idioma actual de la app
  const currentLang = i18n.language === 'es' ? 'Spanish' : 'English';

  setTranslating(prev => ({ ...prev, [messageId]: true }));
  try {
    const resp = await fetch(N8N_TRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: originalText,
        targetLang: currentLang
      })
    });

    if (resp.ok) {
      const data = await resp.json();
      setTranslations(prev => ({ ...prev, [messageId]: data.translatedText }));
    }
  } catch (err) {
    console.error('Translation error:', err);
  } finally {
    setTranslating(prev => ({ ...prev, [messageId]: false }));
  }
};
```

> **IMPORTANTE:** También necesitas importar `i18n` para detectar el idioma actual. Modifica la línea 3:
> ```javascript
> import { useTranslation } from 'react-i18next';
> ```
> Y dentro del componente, cambia:
> ```javascript
> const { t, i18n } = useTranslation();
> ```

#### 2.3.3 — Añadir el botón de traducir y el texto traducido en el JSX

Busca el bloque donde se renderiza cada mensaje (alrededor de las líneas 98-121). Reemplaza toda la función de renderizado de mensajes con esta versión:

```jsx
messages.map((msg, i) => {
  const senderUsername = msg.sender?.username || 'User';
  const isMe = senderUsername === currentUsername;
  const msgId = msg.id || `msg-${i}`;
  return (
    <motion.div
      layout
      key={msgId}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
    >
      {!isMe && (
        <span className="text-[10px] font-bold text-gray-400 mb-1 ml-1 tracking-wider uppercase">
          {senderUsername}
        </span>
      )}
      <div className={`px-4 py-3 rounded-2xl text-sm font-medium ${
        isMe
          ? 'bg-emerald-600 text-white rounded-tr-sm shadow-md shadow-emerald-600/20'
          : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
      }`}>
        {msg.content}
      </div>

      {/* Traducción mostrada debajo */}
      {translations[msgId] && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={`mt-1 px-4 py-2 rounded-xl text-xs italic ${
            isMe
              ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/20'
              : 'bg-blue-50 text-blue-700 border border-blue-100'
          }`}
        >
          {translations[msgId]}
          <span className="block text-[9px] mt-1 opacity-60 not-italic font-bold">
            ✨ {t('tournaments.chat.translated_by_ai')}
          </span>
        </motion.div>
      )}

      {/* Fila de timestamp + botón traducir */}
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[9px] text-gray-300 font-medium italic">
          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </span>
        {!isMe && (
          <button
            onClick={() => handleTranslate(msgId, msg.content)}
            disabled={translating[msgId]}
            className="text-[9px] text-gray-400 hover:text-blue-500 transition-colors font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50"
            title={t('tournaments.chat.translate')}
          >
            {translating[msgId] ? (
              <span className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin"></span>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            )}
            {translations[msgId] ? '✕' : t('tournaments.chat.translate')}
          </button>
        )}
      </div>
    </motion.div>
  );
})
```

### Paso 2.4 — Modificar MatchDetail.jsx (Chat del Partido)

El mismo concepto se aplica al chat dentro de `MatchDetail.jsx`. Los cambios son idénticos en lógica.

#### 2.4.1 — Añadir imports

Después de la línea `import { useToast } from "../context/ToastContext";` (línea 10), añade:

```javascript
import { N8N_TRANSLATE_URL } from '../apiConfig';
```

Y cambia `const { t } = useTranslation();` por:

```javascript
const { t, i18n } = useTranslation();
```

#### 2.4.2 — Añadir estado

Después de `const { showToast } = useToast();` (línea 22), añade:

```javascript
const [translations, setTranslations] = useState({});
const [translating, setTranslating] = useState({});
```

#### 2.4.3 — Añadir función de traducción

Después de `handleSendMessage` (después de la línea 112), añade:

```javascript
const handleTranslate = async (messageId, originalText) => {
  if (translations[messageId]) {
    setTranslations(prev => {
      const copy = { ...prev };
      delete copy[messageId];
      return copy;
    });
    return;
  }

  const currentLang = i18n.language === 'es' ? 'Spanish' : 'English';

  setTranslating(prev => ({ ...prev, [messageId]: true }));
  try {
    const resp = await fetch(N8N_TRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: originalText,
        targetLang: currentLang
      })
    });

    if (resp.ok) {
      const data = await resp.json();
      setTranslations(prev => ({ ...prev, [messageId]: data.translatedText }));
    }
  } catch (err) {
    console.error('Translation error:', err);
  } finally {
    setTranslating(prev => ({ ...prev, [messageId]: false }));
  }
};
```

#### 2.4.4 — Modificar el renderizado del chat

Busca el bloque de renderizado de mensajes (líneas 337-356). Reemplázalo con:

```jsx
{messages.map(m => {
  const isMe = m.user.id === currentUser.id;
  const msgId = m.id;
  return (
    <motion.div 
      key={msgId} 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
    >
      <div className="flex items-center gap-1.5 mb-1 px-1">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{m.user.username}</span>
      </div>
      <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm shadow-sm ${
        isMe 
          ? 'bg-emerald-600 text-white rounded-tr-none' 
          : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
      }`}>
        {m.contenido}
      </div>

      {/* Traducción */}
      {translations[msgId] && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={`mt-1 px-3 py-2 rounded-xl text-xs italic max-w-[85%] ${
            isMe
              ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/20'
              : 'bg-blue-50 text-blue-700 border border-blue-100'
          }`}
        >
          {translations[msgId]}
          <span className="block text-[9px] mt-1 opacity-60 not-italic font-bold">
            ✨ {t('match_chat.translated_by_ai')}
          </span>
        </motion.div>
      )}

      {/* Timestamp + Traducir */}
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[9px] text-gray-300 font-medium italic">
          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {!isMe && (
          <button
            onClick={() => handleTranslate(msgId, m.contenido)}
            disabled={translating[msgId]}
            className="text-[9px] text-gray-400 hover:text-blue-500 transition-colors font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            {translating[msgId] ? (
              <span className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin"></span>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            )}
            {translations[msgId] ? '✕' : t('match_chat.translate')}
          </button>
        )}
      </div>
    </motion.div>
  );
})}
```

---

## PARTE 3: Resumen Visual del Resultado

### Antes (sin traducción):
```
┌─────────────────────────────────────┐
│  Juan                               │
│  ┌───────────────────────┐          │
│  │ Vamos equipo!         │          │
│  └───────────────────────┘          │
│  14:32                              │
│                                     │
│              ┌───────────────────┐  │
│              │ I scored a goal!  │  │
│              └───────────────────┘  │
│                          Tú  14:33  │
└─────────────────────────────────────┘
```

### Después (con traducción):
```
┌─────────────────────────────────────┐
│  Juan                               │
│  ┌───────────────────────┐          │
│  │ Vamos equipo!         │          │
│  └───────────────────────┘          │
│  ┌─ · · · · · · · · · · ─┐         │
│  │ Let's go team!         │         │
│  │ ✨ Translated by AI    │         │
│  └────────────────────────┘         │
│  14:32  🌐 ✕                        │
│                                     │
│              ┌───────────────────┐  │
│              │ I scored a goal!  │  │
│              └───────────────────┘  │
│                          Tú  14:33  │
└─────────────────────────────────────┘
```

---

## PARTE 4: Checklist Final

- [ ] **n8n:** Credenciales de Groq configuradas
- [ ] **n8n:** Workflow creado con Webhook → LLM/HTTP → Respond
- [ ] **n8n:** Workflow **activado** (toggle ON)
- [ ] **n8n:** Probado con `curl` y funciona
- [ ] **Frontend:** `N8N_TRANSLATE_URL` añadida en `apiConfig.js`
- [ ] **Frontend:** Claves de traducción añadidas en `es.json` y `en.json`
- [ ] **Frontend:** `TournamentChat.jsx` actualizado con botón de traducir
- [ ] **Frontend:** `MatchDetail.jsx` actualizado con botón de traducir
- [ ] **Prueba E2E:** Abrir un chat, enviar un mensaje, pulsar "Traducir" en un mensaje de otro usuario

> **CONSEJO:** El botón de traducir **solo aparece en mensajes de otros usuarios**, porque no tiene sentido traducir tus propios mensajes. Además, funciona como **toggle**: si pulsas de nuevo, la traducción desaparece.

> **ADVERTENCIA:** Si tu n8n no tiene HTTPS configurado y la app está en producción (HTTPS), el navegador bloqueará la petición por **mixed content**. Asegúrate de que el webhook de n8n también sea HTTPS.
