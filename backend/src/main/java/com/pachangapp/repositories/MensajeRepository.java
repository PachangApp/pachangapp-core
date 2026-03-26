package com.pachangapp.repositories;

import com.pachangapp.models.Mensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MensajeRepository extends JpaRepository<Mensaje, Long> {
    List<Mensaje> findByPartidoIdOrderByTimestampAsc(Long partidoId);
}
