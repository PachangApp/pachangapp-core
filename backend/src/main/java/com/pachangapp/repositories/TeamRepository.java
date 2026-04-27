package com.pachangapp.repositories;

import com.pachangapp.models.Team;
import com.pachangapp.models.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByTournament(Tournament tournament);
    int countByTournament(Tournament tournament);
}
