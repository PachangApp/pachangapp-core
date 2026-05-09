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

    java.util.List<User> findByPosicion1OrPosicion2OrPosicion3(String p1, String p2, String p3);
}
