package com.pachangapp.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "invitaciones")
public class Invitacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "partido_id", nullable = false)
    private Partido partido;

    @ManyToOne
    @JoinColumn(name = "invitador_id", nullable = false)
    private User invitador;

    @ManyToOne
    @JoinColumn(name = "invitado_id", nullable = false)
    private User invitado;

    @Enumerated(EnumType.STRING)
    private InvitacionStatus estado = InvitacionStatus.PENDIENTE;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum InvitacionStatus {
        PENDIENTE,
        ACEPTADA,
        RECHAZADA
    }

    public Invitacion() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Partido getPartido() {
        return partido;
    }

    public void setPartido(Partido partido) {
        this.partido = partido;
    }

    public User getInvitador() {
        return invitador;
    }

    public void setInvitador(User invitador) {
        this.invitador = invitador;
    }

    public User getInvitado() {
        return invitado;
    }

    public void setInvitado(User invitado) {
        this.invitado = invitado;
    }

    public InvitacionStatus getEstado() {
        return estado;
    }

    public void setEstado(InvitacionStatus estado) {
        this.estado = estado;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
