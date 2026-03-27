package com.pachangapp.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void sendVerificationEmail(String to, String token) {
        String subject = "Verifica tu cuenta en PachangApp";
        String confirmationUrl = "http://localhost:8091/api/users/verify?token=" + token;
        String message = "Bienvenido a PachangApp. Haz clic en el siguiente enlace para activar tu cuenta:\n" + confirmationUrl;

        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(to);
        email.setSubject(subject);
        email.setText(message);
        mailSender.send(email);
    }
}
