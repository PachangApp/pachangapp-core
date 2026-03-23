package com.pachangapp.controllers;

import com.pachangapp.models.Campo;
import com.pachangapp.repositories.CampoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/campos")
@CrossOrigin(origins = "http://localhost:5173")
public class CampoController {

    @Autowired
    private CampoRepository campoRepository;

    @GetMapping
    public List<Campo> getAllCampos() {
        return campoRepository.findAll();
    }

    @GetMapping("/buscar")
    public List<Campo> buscarPorZona(@RequestParam String zona) {
        return campoRepository.findByZonaContainingIgnoreCase(zona);
    }
}
