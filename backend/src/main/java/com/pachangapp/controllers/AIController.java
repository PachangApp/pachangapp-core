package com.pachangapp.controllers;

import com.pachangapp.services.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private AIService aiService;

    @PostMapping("/chat")
    public Map<String, String> getChatResponse(@RequestBody Map<String, String> payload) {
        String prompt = payload.get("prompt");
        String response = aiService.getAIResponse(prompt);
        return Map.of("response", response);
    }
}
