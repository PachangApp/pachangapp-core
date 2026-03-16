package com.pachangapp.models;

import jakarta.persistence.*;

@Entity
@Table(name = "campos")
public class Campo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String zona;
    private String deporte;
    private double precioPorHora;
    private boolean disponible;
    private String imagenUrl; // Será "" por ahora

    public Campo() {}

    public Campo(String nombre, String zona, String deporte, double precioPorHora, boolean disponible, String imagenUrl) {
        this.nombre = nombre;
        this.zona = zona;
        this.deporte = deporte;
        this.precioPorHora = precioPorHora;
        this.disponible = disponible;
        this.imagenUrl = imagenUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getZona() { return zona; }
    public void setZona(String zona) { this.zona = zona; }

    public String getDeporte() { return deporte; }
    public void setDeporte(String deporte) { this.deporte = deporte; }

    public double getPrecioPorHora() { return precioPorHora; }
    public void setPrecioPorHora(double precioPorHora) { this.precioPorHora = precioPorHora; }

    public boolean isDisponible() { return disponible; }
    public void setDisponible(boolean disponible) { this.disponible = disponible; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }
}
