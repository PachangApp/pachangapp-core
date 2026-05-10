package com.pachangapp.repositories;

import com.pachangapp.models.Invitacion;
import com.pachangapp.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InvitacionRepository extends JpaRepository<Invitacion, Long> {
    List<Invitacion> findByInvitadoAndEstado(User invitado, Invitacion.InvitacionStatus estado);

    long countByInvitadoAndEstado(User invitado, Invitacion.InvitacionStatus estado);

    boolean existsByPartidoIdAndInvitadoId(Long partidoId, Long invitadoId);
    boolean existsByPartidoIdAndInvitadoIdAndEstado(Long partidoId, Long invitadoId, Invitacion.InvitacionStatus estado);
}
