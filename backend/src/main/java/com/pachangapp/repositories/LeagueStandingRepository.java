package com.pachangapp.repositories;

import com.pachangapp.models.LeagueStanding;
import com.pachangapp.models.Team;
import com.pachangapp.models.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeagueStandingRepository extends JpaRepository<LeagueStanding, Long> {

    List<LeagueStanding> findByTournamentOrderByPointsDescGoalsForDesc(Tournament tournament);

    Optional<LeagueStanding> findByTournamentAndTeam(Tournament tournament, Team team);

    List<LeagueStanding> findByTournament(Tournament tournament);
}
