package com.pachangapp.controllers;

import com.pachangapp.models.Mensaje;
import com.pachangapp.models.Partido;
import com.pachangapp.models.User;
import com.pachangapp.repositories.MensajeRepository;
import com.pachangapp.repositories.PartidoRepository;
import com.pachangapp.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mensajes")
@CrossOrigin(origins = "*")
public class MensajeController {

    @Autowired
    private MensajeRepository mensajeRepository;

    @Autowired
    private PartidoRepository partidoRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/partido/{partidoId}")
    public List<Mensaje> getMensajes(@PathVariable Long partidoId) {
        return mensajeRepository.findByPartidoIdOrderByTimestampAsc(partidoId);
    }

    @PostMapping
    public ResponseEntity<?> enviarMensaje(@RequestBody Map<String, Object> payload) {
        Long partidoId = Long.valueOf(payload.get("partidoId").toString());
        Long userId = Long.valueOf(payload.get("userId").toString());
        String contenido = payload.get("contenido").toString();

        Partido partido = partidoRepository.findById(partidoId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);

        if (partido == null || user == null) {
            return ResponseEntity.badRequest().body("Partido o Usuario no encontrado");
        }

        Mensaje mensaje = new Mensaje();
        mensaje.setPartido(partido);
        mensaje.setUser(user);
        mensaje.setContenido(contenido);
        mensaje.setTimestamp(LocalDateTime.now());

        mensajeRepository.save(mensaje);
        return ResponseEntity.ok(mensaje);
    }
}
