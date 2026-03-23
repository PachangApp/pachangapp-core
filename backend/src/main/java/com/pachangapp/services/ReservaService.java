package com.pachangapp.services;

import com.pachangapp.models.Campo;
import com.pachangapp.models.Reserva;
import com.pachangapp.repositories.CampoRepository;
import com.pachangapp.repositories.ReservaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ReservaService {

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private CampoRepository campoRepository;

    public List<String> getHorasOcupadasEnJerarquia(Long campoId, LocalDate date) {
        Campo campo = campoRepository.findById(campoId).orElse(null);
        if (campo == null) return Collections.emptyList();

        Set<Long> relatedIds = new HashSet<>();
        relatedIds.add(campoId);

        if (campo.getParentCampoId() != null) {
            relatedIds.add(campo.getParentCampoId());
        }

        List<Campo> hijos = campoRepository.findByParentCampoId(campoId);
        hijos.forEach(h -> relatedIds.add(h.getId()));

        List<Reserva> reservasRelacionadas = reservaRepository.findByCampoIdInAndFecha(relatedIds, date);
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        
        return reservasRelacionadas.stream()
                .map(r -> r.getHoraInicio().format(formatter))
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public boolean isHoraDisponible(Long campoId, LocalDate date, String hora) {
        List<String> ocupadas = getHorasOcupadasEnJerarquia(campoId, date);
        return !ocupadas.contains(hora);
    }
}
