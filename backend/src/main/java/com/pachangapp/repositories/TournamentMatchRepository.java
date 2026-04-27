package com.pachangapp.repositories;

import com.pachangapp.models.Tournament;
import com.pachangapp.models.TournamentMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TournamentMatchRepository extends JpaRepository<TournamentMatch, Long> {
    List<TournamentMatch> findByTournamentOrderByRoundDescMatchIndexAsc(Tournament tournament);
    List<TournamentMatch> findByTournament(Tournament tournament);
}
