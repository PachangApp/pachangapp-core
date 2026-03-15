package com.pachangapp.controllers;

import com.pachangapp.models.User;
import com.pachangapp.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173") // Ajustar si el frontend usa otro puerto (por defecto vite usa 5173)
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        // Todo: Agregar lógica de validación (que el email no exista) y encriptación de
        // contraseña.
        return userRepository.save(user);
    }

    @PostMapping("/login")
    public org.springframework.http.ResponseEntity<String> loginUser(@RequestBody User loginData) {
        // Todo: Mejorar esta lógica básica de autenticación (Implementar JWT o
        // manejador de sesión robusto).
        User user = userRepository.findByEmail(loginData.getEmail()).orElse(null);
        if (user != null && user.getPassword().equals(loginData.getPassword())) {
            return org.springframework.http.ResponseEntity.ok("Login exitoso. Bienvenido " + user.getEmail());
        }
        return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body("Credenciales inválidas");
    }
}
