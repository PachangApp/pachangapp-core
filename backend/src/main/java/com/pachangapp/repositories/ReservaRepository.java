package com.pachangapp.repositories;

import com.pachangapp.models.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    List<Reserva> findByCampoIdAndFecha(Long campoId, LocalDate fecha);
    List<Reserva> findByCampoIdInAndFecha(Collection<Long> campoIds, LocalDate fecha);
}
