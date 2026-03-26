package com.pachangapp.controllers;

import com.pachangapp.models.Partido;
import com.pachangapp.models.Reserva;
import com.pachangapp.models.User;
import com.pachangapp.models.Campo;
import com.pachangapp.repositories.PartidoRepository;
import com.pachangapp.repositories.ReservaRepository;
import com.pachangapp.repositories.UserRepository;
import com.pachangapp.repositories.CampoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;

@RestController
@RequestMapping("/api/partidos")
public class PartidoController {

    @Autowired
    private PartidoRepository partidoRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CampoRepository campoRepository;

    @Autowired
    private com.pachangapp.services.ReservaService reservaService;

    @GetMapping

    public Page<Partido> getPartidos(@RequestParam(defaultValue = "0") int page) {
        return partidoRepository.findByEstadoOrderByReservaFechaAsc("ABIERTO", PageRequest.of(page, 4));
    }

    @PostMapping
    public ResponseEntity<?> crearPartido(@RequestBody Map<String, Object> payload) {
        try {
            Long campoId = Long.valueOf(payload.get("campoId").toString());
            Long userId = Long.valueOf(payload.get("userId").toString());
            String fechaStr = payload.get("fecha").toString();
            String horaStr = payload.get("hora").toString();
            int maxJugadores = Integer.parseInt(payload.get("maxJugadores").toString());

            Campo campo = campoRepository.findById(campoId).orElse(null);
            User user = userRepository.findById(userId).orElse(null);

            if (campo == null || user == null) {
                return ResponseEntity.badRequest().body("Campo o Usuario no encontrado");
            }

            // Validar disponibilidad jerárquica
            if (!reservaService.isHoraDisponible(campoId, LocalDate.parse(fechaStr), horaStr)) {
                return ResponseEntity.badRequest().body("Esta hora no está disponible (campo ocupado total o parcialmente).");
            }


            // 1. Crear la Reserva primero
            Reserva reserva = new Reserva(campo, user, LocalDate.parse(fechaStr), LocalTime.parse(horaStr + ":00"));
            reservaRepository.save(reserva);

            // 2. Crear el Partido asociado
            Partido partido = new Partido(reserva, user, maxJugadores);
            partidoRepository.save(partido);

            return ResponseEntity.ok(partido);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al crear el partido: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/unirse")
    public ResponseEntity<?> unirseAPartido(@PathVariable Long id, @RequestParam Long userId) {
        Partido partido = partidoRepository.findById(id).orElse(null);
        User user = userRepository.findById(userId).orElse(null);

        if (partido == null || user == null) {
            return ResponseEntity.badRequest().body("Partido o Usuario no encontrado");
        }

        if (partido.getJugadores().size() >= partido.getMaxJugadores()) {
            return ResponseEntity.badRequest().body("El partido está lleno");
        }

        if (partido.getJugadores().contains(user)) {
            return ResponseEntity.badRequest().body("Ya estás en este partido");
        }

        partido.getJugadores().add(user);
        if (partido.getJugadores().size() == partido.getMaxJugadores()) {
            partido.setEstado("LLENO");
        }
        
        partidoRepository.save(partido);
        return ResponseEntity.ok(partido);
    }
}
