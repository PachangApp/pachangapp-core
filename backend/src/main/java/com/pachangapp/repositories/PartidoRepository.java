package com.pachangapp.repositories;

import com.pachangapp.models.Partido;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PartidoRepository extends JpaRepository<Partido, Long> {
    Page<Partido> findByEstadoOrderByReservaFechaAsc(String estado, Pageable pageable);
    
    // Obtener los próximos partidos de un usuario concreto (usando la tabla Participacion)
    @org.springframework.data.jpa.repository.Query("SELECT p FROM Partido p JOIN p.participaciones pt WHERE pt.user.id = :userId AND p.estado != 'FINALIZADO' ORDER BY p.reserva.fecha ASC, p.reserva.horaInicio ASC")
    Page<Partido> findProximosPartidosUsuario(@org.springframework.data.repository.query.Param("userId") Long userId, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Partido p JOIN p.participaciones pt WHERE pt.user.id = :userId AND p.estado = 'FINALIZADO' ORDER BY p.reserva.fecha DESC, p.reserva.horaInicio DESC")
    Page<Partido> findHistorialPartidosUsuario(@org.springframework.data.repository.query.Param("userId") Long userId, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Partido p WHERE " +
            "(:lugar IS NULL OR LOWER(p.reserva.campo.nombre) LIKE LOWER(CONCAT('%', :lugar, '%'))) AND " +
            "(:fecha IS NULL OR p.reserva.fecha = :fecha) AND " +
            "p.estado != 'FINALIZADO' " +
            "ORDER BY p.reserva.fecha ASC, p.reserva.horaInicio ASC")
    Page<Partido> searchPartidos(@org.springframework.data.repository.query.Param("lugar") String lugar, 
                                 @org.springframework.data.repository.query.Param("fecha") java.time.LocalDate fecha, 
                                 Pageable pageable);
}
