package com.pachangapp.repositories;

import com.pachangapp.models.Campo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampoRepository extends JpaRepository<Campo, Long> {
    List<Campo> findByZonaContainingIgnoreCase(String zona);
    List<Campo> findByDisponibleTrue();
    List<Campo> findByParentCampoId(Long parentCampoId);
    Optional<Campo> findByNombre(String nombre);
}
