package com.pachangapp.controllers;

import com.opencsv.CSVReader;
import com.opencsv.CSVWriter;
import com.pachangapp.models.*;
import com.pachangapp.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletResponse;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CampoRepository campoRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private com.pachangapp.services.PdfService pdfService;

    // --- GESTIÓN DE USUARIOS ---

    @GetMapping("/users")
    public List<User> listUsers() {
        return userRepository.findAll();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> changeRole(@PathVariable Long id, @RequestParam Role role) {
        return userRepository.findById(id).map(user -> {
            user.setRole(role);
            userRepository.save(user);
            return ResponseEntity.ok(user);
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- GESTIÓN DE PISTAS (CAMPOS) ---

    @PostMapping("/campos")
    public Campo createCampo(@RequestBody Campo campo) {
        return campoRepository.save(campo);
    }

    @PutMapping("/campos/{id}")
    public ResponseEntity<Campo> updateCampo(@PathVariable Long id, @RequestBody Campo campoDetails) {
        return campoRepository.findById(id).map(campo -> {
            campo.setNombre(campoDetails.getNombre());
            campo.setDeporte(campoDetails.getDeporte());
            campo.setZona(campoDetails.getZona());
            campo.setPrecioPorHora(campoDetails.getPrecioPorHora());
            campo.setParentCampoId(campoDetails.getParentCampoId());
            campo.setDisponible(campoDetails.isDisponible());
            campo.setImagenUrl(campoDetails.getImagenUrl());
            campo.setLocationUrl(campoDetails.getLocationUrl()); // Añadido soporte para ubicación
            return ResponseEntity.ok(campoRepository.save(campo));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/campos/{id}")
    public ResponseEntity<?> deleteCampo(@PathVariable Long id) {
        campoRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // --- IMPORTACIÓN / EXPORTACIÓN ---

    @GetMapping("/reservas/export")
    public void exportReservas(HttpServletResponse response) throws Exception {
        String filename = "reservas.csv";
        response.setContentType("text/csv");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");

        CSVWriter writer = new CSVWriter(new OutputStreamWriter(response.getOutputStream()));
        String[] header = {"ID", "Usuario", "Campo", "Fecha", "Hora"};
        writer.writeNext(header);

        List<Reserva> reservas = reservaRepository.findAll();
        for (Reserva r : reservas) {
            writer.writeNext(new String[]{
                    r.getId().toString(),
                    r.getUsuario().getEmail(),
                    r.getCampo().getNombre(),
                    r.getFecha().toString(),
                    r.getHoraInicio().toString()
            });
        }
        writer.close();
    }

    @GetMapping("/reservas/report")
    public void generateReport(HttpServletResponse response) throws Exception {
        List<Reserva> reservas = reservaRepository.findAll();
        byte[] pdf = pdfService.generateGeneralReport(reservas);

        response.setContentType("application/pdf");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"reporte_reservas.pdf\"");
        response.getOutputStream().write(pdf);
        response.getOutputStream().flush();
    }

    @PostMapping("/campos/import")
    public ResponseEntity<?> importCampos(@RequestParam("file") MultipartFile file) {
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] nextLine;
            reader.readNext(); // Saltar cabecera
            int count = 0;
            while ((nextLine = reader.readNext()) != null) {
                // Formato: Nombre, Deporte, Zona, PrecioPorHora, ImagenUrl, NombrePadre
                Campo c = new Campo();
                c.setNombre(nextLine[0].trim());
                c.setDeporte(nextLine[1].trim());
                c.setZona(nextLine[2].trim());
                c.setPrecioPorHora(Double.parseDouble(nextLine[3].trim()));
                c.setDisponible(true);
                
                // Imagen URL (opcional)
                if (nextLine.length > 4 && nextLine[4] != null) {
                    c.setImagenUrl(nextLine[4].trim());
                } else {
                    c.setImagenUrl("");
                }

                // Ubicación (opcional) - Columna 6 (index 6)
                if (nextLine.length > 6 && nextLine[6] != null) {
                    c.setLocationUrl(nextLine[6].trim());
                } else {
                    c.setLocationUrl("");
                }

                // Lógica de Padre (opcional)
                if (nextLine.length > 5 && nextLine[5] != null && !nextLine[5].trim().isEmpty()) {
                    String parentName = nextLine[5].trim();
                    campoRepository.findByNombre(parentName).ifPresent(p -> {
                        c.setParentCampoId(p.getId());
                    });
                }
                
                campoRepository.save(c);
                count++;
            }
            return ResponseEntity.ok("Importados " + count + " campos correctamente.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al importar: " + e.getMessage());
        }
    }
}
