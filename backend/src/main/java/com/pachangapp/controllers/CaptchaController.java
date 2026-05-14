package com.pachangapp.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/security")
public class CaptchaController {

    @PostMapping("/verify-challenge")
    public ResponseEntity<?> verifyCaptcha(@RequestBody Map<String, List<Integer>> payload) {
        List<Integer> selectedPositions = payload.get("selectedPositions");
        List<Integer> targetPositions = payload.get("targetPositions");

        if (selectedPositions == null || targetPositions == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Faltan datos para verificar el CAPTCHA."));
        }

        if (selectedPositions.size() != 3 || targetPositions.size() != 3) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "El número de selecciones debe ser 3."));
        }

        Collections.sort(selectedPositions);
        Collections.sort(targetPositions);

        if (selectedPositions.equals(targetPositions)) {
            return ResponseEntity.ok(Map.of("success", true, "message", "CAPTCHA validado correctamente."));
        } else {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "CAPTCHA incorrecto."));
        }
    }
}
