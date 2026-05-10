package com.pachangapp.repositories;

import com.pachangapp.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByVerificationToken(String token);
    
    Optional<User> findByResetPasswordToken(String token);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.enabled = true AND u.id != :currentUserId AND (u.posicion1 IS NOT NULL OR u.posicion2 IS NOT NULL OR u.posicion3 IS NOT NULL) AND (u.posicion1 != '' OR u.posicion2 != '' OR u.posicion3 != '')")
    org.springframework.data.domain.Page<User> buscarTodosConPosicion(@org.springframework.data.repository.query.Param("currentUserId") Long currentUserId, org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.enabled = true AND u.id != :currentUserId AND (u.posicion1 = :posicion OR u.posicion2 = :posicion OR u.posicion3 = :posicion)")
    org.springframework.data.domain.Page<User> buscarPorPosicion(@org.springframework.data.repository.query.Param("posicion") String posicion, @org.springframework.data.repository.query.Param("currentUserId") Long currentUserId, org.springframework.data.domain.Pageable pageable);
}
