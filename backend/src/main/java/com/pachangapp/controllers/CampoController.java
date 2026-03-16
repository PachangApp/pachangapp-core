package com.pachangapp.controllers;

import com.pachangapp.models.Campo;
import com.pachangapp.repositories.CampoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/campos")
@CrossOrigin(origins = "http://localhost:5173")
public class CampoController {

    @Autowired
    private CampoRepository campoRepository;

    @GetMapping
    public List<Campo> getAllCampos() {
        List<Campo> campos = campoRepository.findAll();
        if (campos.isEmpty()) {
            // Datos de ejemplo si la DB está vacía
            return getMockCampos();
        }
        return campos;
    }

    @GetMapping("/buscar")
    public List<Campo> buscarPorZona(@RequestParam String zona) {
        return campoRepository.findByZonaContainingIgnoreCase(zona);
    }

    private List<Campo> getMockCampos() {
        List<Campo> mock = new ArrayList<>();
        mock.add(new Campo("Campo Municipal El Soto", "Móstoles", "Fútbol", 25.0, true, ""));
        mock.add(new Campo("Centro Deportivo Arganzuela", "Madrid Centro", "Padel", 12.5, true, ""));
        mock.add(new Campo("Polideportivo La Canaleja", "Alcorcón", "Baloncesto", 18.0, false, ""));
        mock.add(new Campo("Estadio Alberto Hierro", "Getafe", "Fútbol", 30.0, true, ""));
        return mock;
    }
}
