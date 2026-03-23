package com.pachangapp.repositories;

import com.pachangapp.models.Partido;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PartidoRepository extends JpaRepository<Partido, Long> {
    Page<Partido> findByEstadoOrderByReservaFechaAsc(String estado, Pageable pageable);
}
