package com.pachangapp.controllers;

import com.pachangapp.models.User;
import com.pachangapp.repositories.UserRepository;
import com.pachangapp.security.jwt.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private com.pachangapp.services.EmailService emailService;

    @Autowired
    private com.pachangapp.services.FileService fileService;

    @org.springframework.beans.factory.annotation.Value("${pachangapp.app.googleClientId}")
    private String googleClientId;

    @org.springframework.beans.factory.annotation.Value("${pachangapp.app.frontendUrl:http://localhost:5173}")
    private String frontendUrl;

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/buscar")
    public org.springframework.http.ResponseEntity<org.springframework.data.domain.Page<User>> buscarJugadores(
            @RequestParam(required = false) String posicion,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.pachangapp.security.services.UserDetailsImpl currentUser) {
        
        Long currentUserId = (currentUser != null) ? currentUser.getId() : -1L;
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);

        if (posicion != null && !posicion.isEmpty() && !posicion.equals("all")) {
            org.springframework.data.domain.Page<User> usuarios = userRepository.buscarPorPosicion(posicion, currentUserId, pageable);
            return org.springframework.http.ResponseEntity.ok(usuarios);
        }
        
        return org.springframework.http.ResponseEntity.ok(userRepository.buscarTodosConPosicion(currentUserId, pageable));
    }


    @PostMapping("/register")
    public org.springframework.http.ResponseEntity<?> registerUser(@RequestBody User user) {
        if (!user.getPassword().matches("^(?=.*[A-Z])(?=.*\\d).{8,}$")) {
            return org.springframework.http.ResponseEntity.badRequest().body("La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un número.");
        }

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return org.springframework.http.ResponseEntity.badRequest().body("El correo electrónico ya está registrado.");
        }
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(com.pachangapp.models.Role.USER);
        user.setEnabled(false);
        user.setVerificationToken(java.util.UUID.randomUUID().toString());
        
        User savedUser = userRepository.save(user);
        emailService.sendVerificationEmail(savedUser.getEmail(), savedUser.getVerificationToken());
        
        return org.springframework.http.ResponseEntity.ok("Usuario registrado. Por favor, verifica tu correo electrónico para activar tu cuenta.");
    }

    @GetMapping("/verify")
    public org.springframework.http.ResponseEntity<?> verifyUser(@RequestParam String token) {
        boolean verified = userRepository.findByVerificationToken(token).map(user -> {
            user.setEnabled(true);
            user.setVerificationToken(null);
            user.setFechaVerificacion(java.time.LocalDate.now());
            userRepository.save(user);
            return true;
        }).orElse(false);

        String redirectUrl = frontendUrl + "/#/verify?status=" + (verified ? "success" : "error");

        return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.FOUND)
                .location(java.net.URI.create(redirectUrl))
                .build();
    }

    @PostMapping("/login")
    public org.springframework.http.ResponseEntity<?> loginUser(@RequestBody User loginData) {
        try {
            User user = userRepository.findByEmail(loginData.getEmail()).orElse(null);
            if (user != null && !user.isEnabled()) {
                return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).body("Tu cuenta no está activada. Revisa tu correo.");
            }

            org.springframework.security.core.Authentication authentication = authenticationManager.authenticate(
                    new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(loginData.getEmail(), loginData.getPassword()));

            org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            com.pachangapp.security.services.UserDetailsImpl userDetails = (com.pachangapp.security.services.UserDetailsImpl) authentication.getPrincipal();

            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("token", jwt);
            response.put("id", userDetails.getId());
            response.put("username", user.getUsername());
            response.put("email", userDetails.getEmail());
            response.put("role", userDetails.getAuthorities().iterator().next().getAuthority());
            response.put("avatar", user.getAvatar());
            response.put("ranking", user.getRanking());
            response.put("goles", user.getGoles());
            response.put("asistencias", user.getAsistencias());
            response.put("partidosJugados", user.getPartidosJugados());

            return org.springframework.http.ResponseEntity.ok(response);
        } catch (org.springframework.security.core.AuthenticationException e) {
            return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body("Credenciales inválidas");
        }
    }

    @PostMapping("/forgot-password")
    public org.springframework.http.ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.isEmpty()) {
            return org.springframework.http.ResponseEntity.badRequest().body("El email es requerido.");
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            String token = java.util.UUID.randomUUID().toString();
            user.setResetPasswordToken(token);
            user.setResetPasswordTokenExpiry(java.time.LocalDateTime.now().plusHours(24)); // Expira en 24h
            userRepository.save(user);

            emailService.sendPasswordResetEmail(user.getEmail(), token);
        }
        
        // Siempre devolvemos OK para no revelar qué emails están registrados
        return org.springframework.http.ResponseEntity.ok("Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.");
    }

    @PostMapping("/reset-password")
    public org.springframework.http.ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> payload) {
        String token = payload.get("token");
        String newPassword = payload.get("password");

        if (token == null || newPassword == null) {
            return org.springframework.http.ResponseEntity.badRequest().body("Token y contraseña son requeridos.");
        }

        if (!newPassword.matches("^(?=.*[A-Z])(?=.*\\d).{8,}$")) {
            return org.springframework.http.ResponseEntity.badRequest().body("La nueva contraseña debe tener al menos 8 caracteres, una letra mayúscula y un número.");
        }

        User user = userRepository.findByResetPasswordToken(token).orElse(null);
        if (user == null) {
            return org.springframework.http.ResponseEntity.badRequest().body("Token inválido o expirado.");
        }

        if (user.getResetPasswordTokenExpiry() != null && user.getResetPasswordTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            return org.springframework.http.ResponseEntity.badRequest().body("El enlace de restablecimiento ha expirado.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);

        return org.springframework.http.ResponseEntity.ok("Contraseña actualizada con éxito.");
    }

    @GetMapping("/{id}")
    public org.springframework.http.ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(org.springframework.http.ResponseEntity::ok)
                .orElse(org.springframework.http.ResponseEntity.notFound().build());
    }

    @GetMapping("/ranking")
    public java.util.List<User> getRanking() {
        return userRepository.findTop10ByEnabledTrueOrderByRankingDesc();
    }

    @PutMapping("/{id}/preferencias")
    public org.springframework.http.ResponseEntity<?> updatePreferences(@PathVariable Long id, @RequestBody java.util.Map<String, String> prefs) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return org.springframework.http.ResponseEntity.notFound().build();

        if (prefs.containsKey("posicion1")) user.setPosicion1(prefs.get("posicion1"));
        if (prefs.containsKey("posicion2")) user.setPosicion2(prefs.get("posicion2"));
        if (prefs.containsKey("posicion3")) user.setPosicion3(prefs.get("posicion3"));

        userRepository.save(user);
        return org.springframework.http.ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/avatar")
    public org.springframework.http.ResponseEntity<?> updateAvatar(@PathVariable Long id, @RequestParam("file") org.springframework.web.multipart.MultipartFile file, jakarta.servlet.http.HttpServletRequest request) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return org.springframework.http.ResponseEntity.notFound().build();

        try {
            String filename = fileService.saveFile(file);
            String baseUrl = org.springframework.web.servlet.support.ServletUriComponentsBuilder.fromRequestUri(request)
                    .replacePath(null)
                    .build()
                    .toUriString();
            String fileUrl = baseUrl + "/uploads/" + filename;
            
            user.setAvatar(fileUrl);
            userRepository.save(user);
            return org.springframework.http.ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return org.springframework.http.ResponseEntity.badRequest().body(e.getMessage());
        } catch (java.io.IOException e) {
            return org.springframework.http.ResponseEntity.internalServerError().body("Error al guardar imagen: " + e.getMessage());
        }
    }

    @PostMapping("/google-auth")
    public org.springframework.http.ResponseEntity<?> googleAuth(@RequestBody java.util.Map<String, String> payload) {
        String tokenString = payload.get("token");
        
        if (tokenString == null || tokenString.isEmpty()) {
            return org.springframework.http.ResponseEntity.badRequest().body("Token es requerido.");
        }
        
        try {
            com.google.api.client.http.HttpTransport transport = new com.google.api.client.http.javanet.NetHttpTransport();
            com.google.api.client.json.JsonFactory jsonFactory = com.google.api.client.json.gson.GsonFactory.getDefaultInstance();
            
            com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier verifier = new com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                .setAudience(java.util.Collections.singletonList(googleClientId))
                .build();
                
            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken idToken = verifier.verify(tokenString);
            
            if (idToken != null) {
                com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload googlePayload = idToken.getPayload();
                
                String email = googlePayload.getEmail();
                String name = (String) googlePayload.get("name");
                
                User user = userRepository.findByEmail(email).orElse(null);
                
                if (user == null) {
                    user = new User();
                    user.setEmail(email);
                    user.setUsername(name != null ? name.replaceAll("\\s+", "") + (int)(Math.random()*1000) : "user" + (int)(Math.random()*1000));
                    user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString())); // Contraseña aleatoria imposible de adivinar
                    user.setRole(com.pachangapp.models.Role.USER);
                    user.setEnabled(true); // Auto-verificado
                    if (googlePayload.get("picture") != null) {
                        user.setAvatar((String) googlePayload.get("picture"));
                    }
                    user = userRepository.save(user); // Guardar e instanciar
                }
                
                org.springframework.security.core.userdetails.UserDetails userDetails = com.pachangapp.security.services.UserDetailsImpl.build(user);
                
                org.springframework.security.core.Authentication authentication = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(authentication);
                
                String jwt = jwtUtils.generateJwtToken(authentication);
                
                java.util.Map<String, Object> response = new java.util.HashMap<>();
                response.put("token", jwt);
                response.put("id", user.getId());
                response.put("username", user.getUsername());
                response.put("email", user.getEmail());
                response.put("role", user.getRole().name());
                
                return org.springframework.http.ResponseEntity.ok(response);
            } else {
                return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body("Token de Google inválido (la verificación falló).");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error backend: " + e.getClass().getName() + " - " + e.getMessage());
        }
    }
}
