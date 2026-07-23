package com.pachangapp.controllers;

import com.pachangapp.services.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private AIService aiService;

    @PostMapping("/chatbot")
    public ResponseEntity<?> getChatbotResponse(@RequestBody Map<String, String> request) {
        String chatInput = request.get("chatInput");
        String language = request.get("language");
        String action = request.get("action");

        if (chatInput == null) {
            chatInput = "";
        }

        String reply = aiService.getChatbotResponse(chatInput, language, action);
        
        Map<String, Object> response = new HashMap<>();
        response.put("respuesta", reply);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/translate")
    public ResponseEntity<?> translateText(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        String targetLang = request.get("targetLang");

        String reply = aiService.translateText(text, targetLang);
        
        Map<String, Object> response = new HashMap<>();
        response.put("translatedText", reply);
        
        return ResponseEntity.ok(response);
    }
}
