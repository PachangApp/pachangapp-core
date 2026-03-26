package com.pachangapp.models;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "partidos")
public class Partido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "reserva_id", referencedColumnName = "id")
    private Reserva reserva;

    @ManyToOne
    @JoinColumn(name = "organizador_id", nullable = false)
    private User organizador;

    @OneToMany(mappedBy = "partido", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Participacion> participaciones = new HashSet<>();

    private int maxJugadores;
    private String deporte;
    private String estado = "ABIERTO"; // ABIERTO, LLENO, FINALIZADO

    private Integer marcadorA;
    private Integer marcadorB;

    public Partido() {}

    public Partido(Reserva reserva, User organizador, int maxJugadores) {
        this.reserva = reserva;
        this.organizador = organizador;
        this.maxJugadores = maxJugadores;
        this.deporte = (reserva.getCampo() != null) ? reserva.getCampo().getDeporte() : "Desconocido";
        // La participación del organizador se crea en el controlador para evitar problemas de persistencia circular
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Reserva getReserva() { return reserva; }
    public void setReserva(Reserva reserva) { this.reserva = reserva; }

    public User getOrganizador() { return organizador; }
    public void setOrganizador(User organizador) { this.organizador = organizador; }

    public Set<Participacion> getParticipaciones() { return participaciones; }
    public void setParticipaciones(Set<Participacion> participaciones) { this.participaciones = participaciones; }

    public int getMaxJugadores() { return maxJugadores; }
    public void setMaxJugadores(int maxJugadores) { this.maxJugadores = maxJugadores; }

    public String getDeporte() { return deporte; }
    public void setDeporte(String deporte) { this.deporte = deporte; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Integer getMarcadorA() { return marcadorA; }
    public void setMarcadorA(Integer marcadorA) { this.marcadorA = marcadorA; }

    public Integer getMarcadorB() { return marcadorB; }
    public void setMarcadorB(Integer marcadorB) { this.marcadorB = marcadorB; }
}
