package com.pachangapp.controllers;

import com.pachangapp.models.Partido;
import com.pachangapp.models.Participacion;
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
import org.springframework.data.domain.Sort;
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

    @Autowired
    private com.pachangapp.repositories.ParticipacionRepository participacionRepository;

    @GetMapping
    public Page<Partido> getPartidos(@RequestParam(defaultValue = "0") int page) {
        return partidoRepository.findByEstadoOrderByReservaFechaAsc("ABIERTO", PageRequest.of(page, 20));
    }

    @GetMapping("/search")
    public java.util.List<java.util.Map<String, Object>> searchPartidos(
            @RequestParam(required = false) String lugar,
            @RequestParam(required = false) String fecha,
            @RequestParam(defaultValue = "0") int page) {
        
        java.time.LocalDate localDate = null;
        if (fecha != null && !fecha.isEmpty()) {
            try {
                localDate = java.time.LocalDate.parse(fecha);
            } catch (Exception e) {
                // Ignorar error de parseo
            }
        }
        
        org.springframework.data.domain.Page<Partido> partidos = partidoRepository.searchPartidos(lugar, localDate, org.springframework.data.domain.PageRequest.of(page, 20));

        return partidos.getContent().stream().map(p -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", p.getId());
            map.put("lugar", p.getReserva().getCampo().getNombre());
            map.put("fecha", p.getReserva().getFecha().toString());
            map.put("hora", p.getReserva().getHoraInicio().toString().substring(0, 5)); // HH:mm
            map.put("deporte", p.getDeporte());
            map.put("plazasLibres", p.getMaxJugadores() - p.getParticipaciones().size());
            map.put("precio", p.getReserva().getCampo().getPrecioPorHora());
            return map;
        }).collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Partido> getPartidoById(@PathVariable Long id) {
        return partidoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/mis-partidos")
    public ResponseEntity<?> getMisPartidos(
            @RequestParam Long userId, 
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "4") int size) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Usuario no encontrado");
        }
        Page<Partido> partidos = partidoRepository.findProximosPartidosUsuario(userId, PageRequest.of(page, size, Sort.by("id").descending()));
        return ResponseEntity.ok(partidos);
    }

    @GetMapping("/historial")
    public ResponseEntity<?> getHistorialPartidos(@RequestParam Long userId, @RequestParam(defaultValue = "0") int page) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Usuario no encontrado");
        }
        Page<Partido> partidos = partidoRepository.findHistorialPartidosUsuario(userId, PageRequest.of(page, 10));
        return ResponseEntity.ok(partidos);
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

            // 3. Crear Participación inicial del organizador
            com.pachangapp.models.Participacion p = new com.pachangapp.models.Participacion(user, partido);
            participacionRepository.save(p);

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

        if (partido.getParticipaciones().size() >= partido.getMaxJugadores()) {
            return ResponseEntity.badRequest().body("El partido está lleno");
        }

        boolean yaInscrito = participacionRepository.findByUserIdAndPartidoId(userId, id).isPresent();
        if (yaInscrito) {
            return ResponseEntity.badRequest().body("Ya estás en este partido");
        }

        com.pachangapp.models.Participacion p = new com.pachangapp.models.Participacion(user, partido);
        participacionRepository.save(p);
        
        // Recargar partido para ver cambios en participaciones
        partido = partidoRepository.findById(id).get();

        if (partido.getParticipaciones().size() == partido.getMaxJugadores()) {
            partido.setEstado("LLENO");
            partidoRepository.save(partido);
        }
        
        return ResponseEntity.ok(partido);
    }

    @PostMapping("/{id}/asignar-equipo")
    public ResponseEntity<?> asignarEquipo(@PathVariable Long id, @RequestParam Long userId, @RequestParam String equipo, @RequestParam(required = false) String colorRgb) {
        Participacion participacion = participacionRepository.findByUserIdAndPartidoId(userId, id).orElse(null);
        if (participacion == null) {
            return ResponseEntity.badRequest().body("El usuario no está inscrito en este partido");
        }
        participacion.setEquipo(equipo); // NEGRO, BLANCO, NINGUNO
        if (colorRgb != null) {
            participacion.setColorRgb(colorRgb);
        }
        participacionRepository.save(participacion);
        return ResponseEntity.ok("Equipo asignado");
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<?> finalizarPartido(@PathVariable Long id, @RequestParam int marcadorA, @RequestParam int marcadorB) {
        Partido partido = partidoRepository.findById(id).orElse(null);
        if (partido == null) return ResponseEntity.badRequest().body("Partido no encontrado");
        
        if ("FINALIZADO".equals(partido.getEstado())) {
            return ResponseEntity.badRequest().body("El partido ya está finalizado");
        }

        partido.setMarcadorA(marcadorA);
        partido.setMarcadorB(marcadorB);
        partido.setEstado("FINALIZADO");

        // Lógica de ELO y Estadísticas
        String equipoGanador = "EMPATE";
        if (marcadorA > marcadorB) equipoGanador = "BLANCO";
        else if (marcadorB > marcadorA) equipoGanador = "NEGRO";

        for (com.pachangapp.models.Participacion p : partido.getParticipaciones()) {
            User user = p.getUser();
            user.setPartidosJugados(user.getPartidosJugados() + 1);

            if (!"EMPATE".equals(equipoGanador)) {
                if (p.getEquipo().equals(equipoGanador)) {
                    user.setVictorias(user.getVictorias() + 1);
                    user.setRanking(user.getRanking() + 15);
                } else if (!p.getEquipo().equals("NINGUNO")) {
                    user.setDerrotas(user.getDerrotas() + 1);
                    user.setRanking(Math.max(0, user.getRanking() - 10));
                }
            } else {
                // Empate: pequeño ajuste o nada
                user.setRanking(user.getRanking() + 2);
            }
            userRepository.save(user);
        }

        partidoRepository.save(partido);
        return ResponseEntity.ok("Partido finalizado y estadísticas actualizadas");
    }

    @PostMapping("/{id}/cambiar-color")
    public ResponseEntity<?> cambiarColor(@PathVariable Long id, @RequestParam String equipo, @RequestParam String color) {
        Partido partido = partidoRepository.findById(id).orElse(null);
        if (partido == null) return ResponseEntity.notFound().build();
        
        for (Participacion p : partido.getParticipaciones()) {
            if (p.getEquipo().equalsIgnoreCase(equipo)) {
                p.setColorRgb(color);
                participacionRepository.save(p);
            }
        }
        return ResponseEntity.ok().build();
    }
}
