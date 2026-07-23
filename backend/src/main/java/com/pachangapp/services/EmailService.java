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
        String subject = "Verifica tu cuenta en PachangApp";
        String confirmationUrl = baseUrl + "/api/users/verify?token=" + token;
        String message = "¡Bienvenido a PachangApp!\n\n"
                + "Por favor, haz clic en el siguiente enlace para verificar tu cuenta y activar tu perfil:\n"
                + confirmationUrl + "\n\n"
                + "¡Nos vemos en la cancha!\n"
                + "El equipo de PachangApp";

        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setTo(to);
            email.setSubject(subject);
            email.setText(message);
            mailSender.send(email);
        } catch (Exception e) {
            System.err.println("Error enviando email de verificación directa: " + e.getMessage());
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
