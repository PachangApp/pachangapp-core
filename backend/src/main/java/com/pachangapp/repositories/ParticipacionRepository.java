package com.pachangapp.repositories;

import com.pachangapp.models.Participacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ParticipacionRepository extends JpaRepository<Participacion, Long> {
    Optional<Participacion> findByUserIdAndPartidoId(Long userId, Long partidoId);
}
