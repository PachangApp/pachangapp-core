package com.pachangapp.controllers;

import com.pachangapp.models.Invitacion;
import com.pachangapp.models.Partido;
import com.pachangapp.models.User;
import com.pachangapp.repositories.InvitacionRepository;
import com.pachangapp.repositories.PartidoRepository;
import com.pachangapp.repositories.UserRepository;
import com.pachangapp.repositories.ParticipacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invitaciones")
public class InvitacionController {

    @Autowired
    private InvitacionRepository invitacionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PartidoRepository partidoRepository;

    @Autowired
    private ParticipacionRepository participacionRepository;

    @PostMapping
    public ResponseEntity<?> enviarInvitacion(@RequestBody Map<String, Long> payload) {
        Long partidoId = payload.get("partidoId");
        Long invitadorId = payload.get("invitadorId");
        Long invitadoId = payload.get("invitadoId");

        if (invitadorId.equals(invitadoId)) {
            return ResponseEntity.badRequest().body("ERROR_SELF_INVITE");
        }

        if (invitacionRepository.existsByPartidoIdAndInvitadoIdAndEstado(partidoId, invitadoId, Invitacion.InvitacionStatus.PENDIENTE)) {
            return ResponseEntity.badRequest().body("ERROR_ALREADY_INVITED");
        }

        boolean yaEnPartido = participacionRepository.findByUserIdAndPartidoId(invitadoId, partidoId).isPresent();
        if (yaEnPartido) {
            return ResponseEntity.badRequest().body("ERROR_ALREADY_PARTICIPATING");
        }

        User invitador = userRepository.findById(invitadorId).orElse(null);
        User invitado = userRepository.findById(invitadoId).orElse(null);
        Partido partido = partidoRepository.findById(partidoId).orElse(null);

        if (invitador == null || invitado == null || partido == null) {
            return ResponseEntity.badRequest().body("Datos inválidos");
        }

        Invitacion invitacion = new Invitacion();
        invitacion.setInvitador(invitador);
        invitacion.setInvitado(invitado);
        invitacion.setPartido(partido);
        invitacionRepository.save(invitacion);

        return ResponseEntity.ok("Invitación enviada");
    }

    @GetMapping("/pendientes")
    public ResponseEntity<?> getPendientes(@RequestParam Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        
        List<Invitacion> pendientes = invitacionRepository.findByInvitadoAndEstado(user, Invitacion.InvitacionStatus.PENDIENTE);
        return ResponseEntity.ok(pendientes);
    }

    @GetMapping("/count")
    public ResponseEntity<?> getCount(@RequestParam Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.ok(Map.of("count", 0));
        
        long count = invitacionRepository.countByInvitadoAndEstado(user, Invitacion.InvitacionStatus.PENDIENTE);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}/responder")
    public ResponseEntity<?> responder(@PathVariable Long id, @RequestParam String accion) {
        Invitacion invitacion = invitacionRepository.findById(id).orElse(null);
        if (invitacion == null) return ResponseEntity.notFound().build();

        if (accion.equalsIgnoreCase("ACEPTAR")) {
            invitacion.setEstado(Invitacion.InvitacionStatus.ACEPTADA);
            
            // Unir al usuario al partido
            Partido partido = invitacion.getPartido();
            User invitado = invitacion.getInvitado();

            if (partido.getParticipaciones().size() >= partido.getMaxJugadores()) {
                return ResponseEntity.badRequest().body("ERROR_MATCH_FULL");
            }

            if (participacionRepository.findByUserIdAndPartidoId(invitado.getId(), partido.getId()).isEmpty()) {
                com.pachangapp.models.Participacion p = new com.pachangapp.models.Participacion(invitado, partido);
                participacionRepository.save(p);
            }
        } else {
            invitacion.setEstado(Invitacion.InvitacionStatus.RECHAZADA);
        }

        invitacionRepository.save(invitacion);
        return ResponseEntity.ok("Respuesta procesada");
    }
}
