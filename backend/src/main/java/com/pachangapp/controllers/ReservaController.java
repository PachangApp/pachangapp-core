package com.pachangapp.controllers;

import com.pachangapp.models.Reserva;
import com.pachangapp.models.Campo;
import com.pachangapp.models.User;
import com.pachangapp.repositories.ReservaRepository;
import com.pachangapp.repositories.CampoRepository;
import com.pachangapp.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController

@RequestMapping("/api/reservas")
public class ReservaController {

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private CampoRepository campoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.pachangapp.services.ReservaService reservaService;

    @Autowired
    private com.pachangapp.services.PdfService pdfService;

    // Obtener horas ocupadas considerando jerarquía (F11 vs F7)

    @GetMapping("/disponibilidad")
    public ResponseEntity<List<String>> getDisponibilidad(@RequestParam Long campoId, @RequestParam String fecha) {
        LocalDate date = LocalDate.parse(fecha);
        List<String> horasOcupadas = reservaService.getHorasOcupadasEnJerarquia(campoId, date);
        return ResponseEntity.ok(horasOcupadas);
    }

    @GetMapping("/{id}/export-pdf")
    public ResponseEntity<byte[]> exportReservaPdf(@PathVariable Long id) {
        return reservaRepository.findById(id).map(reserva -> {
            byte[] pdfBytes = pdfService.generateReservaPdf(reserva);
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"reserva_" + id + ".pdf\"")
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        }).orElse(ResponseEntity.notFound().build());
    }



    // Crear una nueva reserva
    @PostMapping
    public ResponseEntity<?> crearReserva(@RequestBody ReservaRequest request) {
        LocalDate fechaReserva = LocalDate.parse(request.getFecha());
        LocalDate hoy = LocalDate.now();
        
        // Regla: No más de una semana de antelación
        if (fechaReserva.isAfter(hoy.plusDays(7))) {
            return ResponseEntity.badRequest().body("Solo se puede reservar con un máximo de una semana de antelación.");
        }
        
        if (fechaReserva.isBefore(hoy)) {
            return ResponseEntity.badRequest().body("No se puede reservar en fechas pasadas.");
        }

        Campo campo = campoRepository.findById(request.getCampoId()).orElse(null);
        User usuario = userRepository.findById(request.getUserId()).orElse(null);

        if (campo == null || usuario == null) {
            return ResponseEntity.badRequest().body("Campo o Usuario no encontrado.");
        }

        // Verificar si ya está ocupado considerando la jerarquía (F11 vs F7)
        if (!reservaService.isHoraDisponible(request.getCampoId(), fechaReserva, request.getHora())) {
            return ResponseEntity.badRequest().body("Esta hora no está disponible (campo ocupado total o parcialmente).");
        }



        Reserva nueva = new Reserva(campo, usuario, fechaReserva, java.time.LocalTime.parse(request.getHora()));
        reservaRepository.save(nueva);

        return ResponseEntity.ok(nueva);
    }

    // Clase auxiliar para la petición
    public static class ReservaRequest {
        private Long campoId;
        private Long userId;
        private String fecha;
        private String hora;

        public Long getCampoId() { return campoId; }
        public void setCampoId(Long campoId) { this.campoId = campoId; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getFecha() { return fecha; }
        public void setFecha(String fecha) { this.fecha = fecha; }
        public String getHora() { return hora; }
        public void setHora(String hora) { this.hora = hora; }
    }
}
