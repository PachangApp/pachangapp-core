package com.pachangapp.models;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String email;
    private String password;
    private String avatar;

    private int partidosJugados = 0;
    private int victorias = 0;
    private int derrotas = 0;
    private int ranking = 1000;
    private String posicion1;
    private String posicion2;
    private String posicion3;

    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;

    private boolean enabled = false;
    private String verificationToken;
    private java.time.LocalDate fechaVerificacion;

    private String resetPasswordToken;
    private java.time.LocalDateTime resetPasswordTokenExpiry;

    public User() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public int getPartidosJugados() {
        return partidosJugados;
    }

    public void setPartidosJugados(int partidosJugados) {
        this.partidosJugados = partidosJugados;
    }

    public int getVictorias() {
        return victorias;
    }

    public void setVictorias(int victorias) {
        this.victorias = victorias;
    }

    public int getDerrotas() {
        return derrotas;
    }

    public void setDerrotas(int derrotas) {
        this.derrotas = derrotas;
    }

    public int getRanking() {
        return ranking;
    }

    public void setRanking(int ranking) {
        this.ranking = ranking;
    }

    public String getPosicion1() {
        return posicion1;
    }

    public void setPosicion1(String posicion1) {
        this.posicion1 = posicion1;
    }

    public String getPosicion2() {
        return posicion2;
    }

    public void setPosicion2(String posicion2) {
        this.posicion2 = posicion2;
    }

    public String getPosicion3() {
        return posicion3;
    }

    public void setPosicion3(String posicion3) {
        this.posicion3 = posicion3;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getVerificationToken() {
        return verificationToken;
    }

    public void setVerificationToken(String verificationToken) {
        this.verificationToken = verificationToken;
    }

    public java.time.LocalDate getFechaVerificacion() {
        return fechaVerificacion;
    }

    public void setFechaVerificacion(java.time.LocalDate fechaVerificacion) {
        this.fechaVerificacion = fechaVerificacion;
    }

    public String getResetPasswordToken() {
        return resetPasswordToken;
    }

    public void setResetPasswordToken(String resetPasswordToken) {
        this.resetPasswordToken = resetPasswordToken;
    }

    public java.time.LocalDateTime getResetPasswordTokenExpiry() {
        return resetPasswordTokenExpiry;
    }

    public void setResetPasswordTokenExpiry(java.time.LocalDateTime resetPasswordTokenExpiry) {
        this.resetPasswordTokenExpiry = resetPasswordTokenExpiry;
    }
}
