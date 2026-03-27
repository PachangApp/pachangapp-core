package com.pachangapp.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIService {

    @Value("${pachangapp.app.openaiApiKey:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String OPENAI_URL = "https://api.openai.org/v1/chat/completions";

    public String getAIResponse(String prompt) {
        if (apiKey == null || apiKey.isEmpty()) {
            return "Configura tu OPENAI_API_KEY para recibir respuestas inteligentes.";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-3.5-turbo");
        body.put("messages", List.of(
            Map.of("role", "system", "content", "Eres un asistente experto para PachangApp, una plataforma de reserva de pistas deportivas."),
            Map.of("role", "user", "content", prompt)
        ));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            Map<String, Object> response = restTemplate.postForObject(OPENAI_URL, entity, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            return "Error al conectar con la IA: " + e.getMessage();
        }
    }
}
