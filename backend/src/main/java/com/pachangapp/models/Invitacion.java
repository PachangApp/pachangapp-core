package com.pachangapp.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
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
}
