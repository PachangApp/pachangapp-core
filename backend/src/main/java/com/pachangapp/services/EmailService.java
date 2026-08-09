package com.pachangapp.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${pachangapp.app.baseUrl}")
    private String baseUrl;

    @Value("${pachangapp.app.frontendUrl:https://pachangapp.es}")
    private String frontendUrl;

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
            System.out.println("Email de verificación enviado correctamente a: " + to);
        } catch (Exception e) {
            System.err.println("Error enviando email de verificación directa a " + to + ": " + e.getMessage());
            e.printStackTrace();
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
