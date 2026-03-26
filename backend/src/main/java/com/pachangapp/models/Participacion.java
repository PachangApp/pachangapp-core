package com.pachangapp.models;

import jakarta.persistence.*;

@Entity
@Table(name = "participaciones")
public class Participacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "partido_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Partido partido;

    private String equipo = "NINGUNO"; // NEGRO, BLANCO, NINGUNO
    private String colorRgb = "#000000";

    public Participacion() {}

    public Participacion(User user, Partido partido) {
        this.user = user;
        this.partido = partido;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Partido getPartido() { return partido; }
    public void setPartido(Partido partido) { this.partido = partido; }

    public String getEquipo() { return equipo; }
    public void setEquipo(String equipo) { this.equipo = equipo; }

    public String getColorRgb() { return colorRgb; }
    public void setColorRgb(String colorRgb) { this.colorRgb = colorRgb; }
}
