package com.pachangapp.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pachangapp.models.Partido;
import com.pachangapp.repositories.PartidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AIService {

    @Value("${pachangapp.ai.url}")
    private String aiUrl;

    @Value("${pachangapp.ai.key}")
    private String aiKey;

    @Value("${pachangapp.ai.model}")
    private String aiModel;

    @Autowired
    private PartidoRepository partidoRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Traduce el texto al idioma destino manteniendo un tono informal y futbolero.
     */
    public String translateText(String text, String targetLang) {
        if (text == null || text.trim().isEmpty()) {
            return "";
        }
        if (targetLang == null) {
            targetLang = "es";
        }

        String systemPrompt = "Eres un traductor experto. Tu ÚNICA tarea es traducir el texto del usuario al idioma indicado. Mantén el tono informal y futbolero. Devuelve SOLO el texto traducido, sin explicaciones, sin comillas, sin prefijos.";
        String userPrompt = String.format("Traduce el siguiente texto al %s: %s", targetLang, text);

        return callOpenAiCompatible(systemPrompt, userPrompt, 0.1);
    }

    /**
     * Gestiona las interacciones con PachanBot.
     */
    public String getChatbotResponse(String chatInput, String language, String action) {
        if (language == null) {
            language = "es";
        }
        boolean isEnglish = "en".equalsIgnoreCase(language);

        // 1. Interceptar intenciones rápidas (Ahorro de tokens y respuesta instantánea)
        if ("como_reservar".equalsIgnoreCase(action)) {
            return isEnglish 
                ? "🏟️ BOOKING A PITCH IS EASY! 🏟️\n\nFollow these simple steps:\n\n1️⃣ Go to 'Create Match' from the main menu.\n2️⃣ Select your preferred sports field.\n3️⃣ Choose the date and time (gray ones are already taken).\n4️⃣ Enter the maximum number of players.\n5️⃣ Confirm and... you're all set! ✅"
                : "🏟️ ¡RESERVAR PISTA ES MUY FÁCIL! 🏟️\n\nSigue estos sencillos pasos:\n\n1️⃣ Entra en 'Crear Partido' desde el menú principal.\n2️⃣ Selecciona el campo deportivo que prefieras.\n3️⃣ Elige la fecha y hora (las grises ya están ocupadas).\n4️⃣ Indica el número máximo de jugadores.\n5️⃣ Confirma y... ¡listo! ✅";
        }

        if ("como_unirse".equalsIgnoreCase(action)) {
            return isEnglish
                ? "⚽ Joining a match is super easy!\n\n1️⃣ Go to 'Explore' in the main menu.\n2️⃣ Click on 'Find Matches' in the dropdown.\n3️⃣ You'll see all open matches with free spots.\n4️⃣ You can filter by location or date to find the one you like best.\n5️⃣ Click on the match you're interested in to see the details.\n6️⃣ Hit 'Join' and you're in! 🎉 Once inside, you'll be able to see the other players and choose your team (white or black).\n\nSee you on the pitch! 🏃‍♂️"
                : "⚽ ¡Unirte a un partido es súper sencillo!\n\n1️⃣ Ve a 'Explorar' en el menú principal.\n2️⃣ Haz Click en 'Buscar Partidos' en el desplegable.\n3️⃣ Verás todos los partidos abiertos con plazas libres.\n4️⃣ Puedes filtrar por lugar o fecha para encontrar el que más te guste.\n5️⃣ Pulsa en el partido que te interese para ver los detalles.\n6️⃣ Dale a 'Unirme' y ya estás dentro 🎉 Una vez dentro, podrás ver a los demás jugadores y elegir tu equipo (blanco o negro).\n\n¡Nos vemos en la cancha! 🏃‍♂️";
        }

        // 2. Comprobar si el mensaje pide buscar partidos de forma explícita o por acción
        boolean requiresMatches = "buscar_partido".equalsIgnoreCase(action) 
                || chatInput.toLowerCase().contains("buscar partido") 
                || chatInput.toLowerCase().contains("busca partido") 
                || chatInput.toLowerCase().contains("partidos disponibles") 
                || chatInput.toLowerCase().contains("quiero jugar");

        if (requiresMatches) {
            // Obtener partidos abiertos activos
            List<Partido> partidos = partidoRepository.findByEstadoOrderByReservaFechaAsc("ABIERTO", PageRequest.of(0, 15)).getContent();
            List<Map<String, Object>> partidosFormatted = new ArrayList<>();
            for (Partido p : partidos) {
                Map<String, Object> map = new HashMap<>();
                map.put("lugar", p.getReserva().getCampo().getNombre());
                map.put("fecha", p.getReserva().getFecha().toString());
                map.put("hora", p.getReserva().getHoraInicio().toString().substring(0, 5));
                map.put("deporte", p.getDeporte());
                map.put("plazasLibres", p.getMaxJugadores() - p.getParticipaciones().size());
                map.put("precio", p.getReserva().getCampo().getPrecioPorHora());
                partidosFormatted.add(map);
            }

            String partidosJson = "[]";
            try {
                partidosJson = objectMapper.writeValueAsString(partidosFormatted);
            } catch (Exception e) {
                System.err.println("Error formateando partidos a JSON: " + e.getMessage());
            }

            String dateToday = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            String systemPrompt = "Eres PachanBot, el colega futbolero y asistente amigable de PachangApp. Tu misión es animar a la gente a jugar al fútbol y ayudarles a encontrar partido.\n\n"
                    + "### CONTEXTO TEMPORAL Y DE USUARIO\n"
                    + "- FECHA DE HOY: " + dateToday + " (Usa esto para saber cuándo es 'hoy', 'mañana' o los próximos días).\n"
                    + "- IDIOMA DEL USUARIO: " + language + "\n\n"
                    + "### REGLAS DE COMPORTAMIENTO Y RESPUESTA (ESTRICTAS):\n"
                    + "1. LA REGLA DE ORO (SIEMPRE MUESTRA PARTIDOS): Si el usuario saluda o busca partidos, muéstrale con entusiasmo los partidos disponibles del JSON.\n"
                    + "2. BÚSQUEDAS ESPECÍFICAS (FILTRO INTELIGENTE): Si el usuario menciona un lugar (ej: 'Cartuja', 'Fuentenueva') o deporte (Fútbol 11, Fútbol Sala), filtra los partidos que coincidan en el JSON y muéstraselos.\n"
                    + "3. EL PLAN B (NUNCA DEJES LA PANTALLA VACÍA): Si no hay partidos exactamente en ese lugar o fecha, dile de forma simpática que no hay exactamente en esa búsqueda, pero recomiéndale otros de los disponibles en el JSON para que no se quede sin jugar.\n"
                    + "4. FORMATO Y TRADUCCIÓN HUMANA:\n"
                    + "   - NUNCA uses fechas en formato base de datos ('YYYY-MM-DD'). Tradúcelas SIEMPRE a lenguaje natural (ej: 'hoy a las 18:00', 'este martes', 'mañana').\n"
                    + "   - Lista los partidos de forma atractiva usando emojis (🏟️, ⚽, 💶, 🎟️) detallando: Deporte, Lugar, Fecha natural, Hora, Precio y Plazas Libres.\n"
                    + "   - Escribe natural, como si chatearas por WhatsApp.\n"
                    + "5. REGLA DE IDIOMA: Responde SIEMPRE en el idioma indicado ('es' para español, 'en' para inglés).\n"
                    + "6. CIERRE MOTIVADOR: Anima al usuario a ir a la sección 'Explorar' de la app para unirse a los partidos.";

            String userPrompt = String.format("Mensaje del usuario: \"%s\"\n\nDatos de partidos disponibles en la app (JSON):\n%s", chatInput, partidosJson);
            return callOpenAiCompatible(systemPrompt, userPrompt, 0.7);
        }

        // 3. Conversación libre estándar
        String systemPrompt = "Eres PachanBot, el colega futbolero y asistente amigable de PachangApp. Tu misión es animar a la gente a jugar al fútbol y resolver dudas generales sobre la aplicación de forma natural, graciosa, entusiasta y amigable. Responde siempre en el idioma del usuario ('es' para español, 'en' para inglés).";
        return callOpenAiCompatible(systemPrompt, chatInput, 0.7);
    }

    /**
     * Llama al API compatible con OpenAI / Groq.
     */
    private String callOpenAiCompatible(String systemPrompt, String userPrompt, double temperature) {
        if (aiKey == null || aiKey.trim().isEmpty()) {
            return "Error: No se ha configurado la API Key de Inteligencia Artificial (PACHANGAPP_AI_KEY) en el servidor. Por favor, añádela para activar a PachanBot.";
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + aiKey);

            Map<String, Object> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", systemPrompt);

            Map<String, Object> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", userPrompt);

            List<Map<String, Object>> messages = Arrays.asList(systemMessage, userMessage);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", aiModel);
            requestBody.put("messages", messages);
            requestBody.put("temperature", temperature);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(aiUrl, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode choices = root.path("choices");
                if (choices.isArray() && choices.size() > 0) {
                    return choices.get(0).path("message").path("content").asText().trim();
                }
            }
            return "Lo siento, mi conexión con la portería de la IA ha fallado. ¡Inténtalo de nuevo en unos minutos! ⚽";

        } catch (Exception e) {
            System.err.println("Error llamando a la API de IA: " + e.getMessage());
            return "¡Uy! Parece que ha habido un problema en el campo de juego de la IA: " + e.getMessage();
        }
    }
}
