package com.pachangapp.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${pachangapp.app.baseUrl}")
    private String baseUrl;

    @Value("${pachangapp.app.frontendUrl:https://pachangapp.es}")
    private String frontendUrl;

    @Value("${pachangapp.n8n.webhookUrl}")
    private String n8nWebhookUrl;

    @Async
    public void sendVerificationEmail(String to, String token) {
        String confirmationUrl = baseUrl + "/api/users/verify?token=" + token;
        
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "verification");
        payload.put("email", to);
        payload.put("token", token);
        payload.put("url", confirmationUrl);

        try {
            restTemplate.postForEntity(n8nWebhookUrl, payload, String.class);
        } catch (Exception e) {
            System.err.println("Error enviando email a n8n: " + e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetEmail(String to, String token) {
        String subject = "Restablecer tu contraseña en PachangApp";
        String resetUrl = frontendUrl + "/#/reset-password?token=" + token;
        String message = "Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:\n" + resetUrl + "\n\nSi no fuiste tú, ignora este correo.";

        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(to);
        email.setSubject(subject);
        email.setText(message);
        mailSender.send(email);
    }
}
