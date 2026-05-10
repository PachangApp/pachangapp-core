package com.pachangapp.services;

import com.pachangapp.models.LeagueStanding;
import com.pachangapp.models.Team;
import com.pachangapp.models.Tournament;
import com.pachangapp.models.TournamentMatch;
import com.pachangapp.models.User;
import com.pachangapp.repositories.LeagueStandingRepository;
import com.pachangapp.repositories.TeamRepository;
import com.pachangapp.repositories.TournamentMatchRepository;
import com.pachangapp.repositories.TournamentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class TournamentService {

    @Autowired
    private TournamentRepository tournamentRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private TournamentMatchRepository matchRepository;

    @Autowired
    private LeagueStandingRepository standingRepository;

    // ─────────────────────────────────────────────
    // Basic CRUD
    // ─────────────────────────────────────────────

    public List<Tournament> getAllTournaments() {
        return tournamentRepository.findAll();
    }

    public Tournament getTournament(Long id) {
        return tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));
    }

    public Tournament createTournament(Tournament tournament) {
        return tournamentRepository.save(tournament);
    }

    // ─────────────────────────────────────────────
    // Join & Auto-start
    // ─────────────────────────────────────────────

    @Transactional
    public Team joinTournament(Long tournamentId, String teamName, User creator, List<User> players) {
        Tournament tournament = getTournament(tournamentId);

        if (!"OPEN".equals(tournament.getStatus())) {
            throw new RuntimeException("Tournament is not open for registration.");
        }

        int currentTeams = teamRepository.countByTournament(tournament);
        if (currentTeams >= tournament.getMaxTeams()) {
            throw new RuntimeException("Tournament is already full.");
        }

        if (creator != null && (tournament.getCreator() == null || !creator.getId().equals(tournament.getCreator().getId()))) {
            boolean alreadyRegistered = teamRepository.findByTournament(tournament).stream()
                .anyMatch(t -> t.getCreator() != null && t.getCreator().getId().equals(creator.getId()));
            if (alreadyRegistered) {
                throw new RuntimeException("Solo puedes registrar un equipo por torneo a menos que seas el creador del torneo.");
            }
        }

        Team team = new Team();
        team.setTournament(tournament);
        team.setName(teamName);
        team.setCreator(creator);
        team.getPlayers().addAll(players);

        if (creator != null && !team.getPlayers().contains(creator)) {
            team.getPlayers().add(creator);
        }

        Team savedTeam = teamRepository.save(team);
        currentTeams++;

        // Auto-start when full
        if (currentTeams == tournament.getMaxTeams()) {
            startTournament(tournament);
        }

        return savedTeam;
    }

    private void startTournament(Tournament tournament) {
        tournament.setStatus("IN_PROGRESS");
        tournamentRepository.save(tournament);

        List<Team> teams = teamRepository.findByTournament(tournament);
        Collections.shuffle(teams);

        String type = tournament.getType();
        if ("LIGA".equalsIgnoreCase(type)) {
            generateLeagueSchedule(tournament, teams);
        } else {
            generateKnockoutBracket(tournament, teams);
        }
    }

    // ─────────────────────────────────────────────
    // LIGA: Round-Robin Schedule Generator
    // ─────────────────────────────────────────────

    private void generateLeagueSchedule(Tournament tournament, List<Team> teams) {
        // Initialize standings for every team
        for (Team team : teams) {
            LeagueStanding standing = new LeagueStanding();
            standing.setTournament(tournament);
            standing.setTeam(team);
            standingRepository.save(standing);
        }

        List<Team> rotation = new ArrayList<>(teams);
        boolean addedBye = false;

        // If odd number of teams, add a virtual BYE team
        if (rotation.size() % 2 != 0) {
            rotation.add(null); // null = BYE
            addedBye = true;
        }

        int n = rotation.size();
        int totalRounds = n - 1;
        int matchesPerRound = n / 2;

        // Fix first team, rotate the rest (standard round-robin algorithm)
        Team fixed = rotation.get(0);

        for (int round = 0; round < totalRounds; round++) {
            for (int i = 0; i < matchesPerRound; i++) {
                Team home = (i == 0) ? fixed : rotation.get(i);
                Team away = rotation.get(n - 1 - i);

                // Skip BYE matchups
                if (home == null || away == null) continue;

                TournamentMatch match = new TournamentMatch();
                match.setTournament(tournament);
                match.setTeamA(home);
                match.setTeamB(away);
                match.setMatchday(round + 1);
                match.setRound("LIGA_J" + (round + 1));
                match.setMatchIndex(i);
                match.setStatus("PENDING");
                matchRepository.save(match);
            }

            // Rotate: keep position 0 fixed, rotate positions 1..n-1
            Team last = rotation.get(n - 1);
            for (int i = n - 1; i > 1; i--) {
                rotation.set(i, rotation.get(i - 1));
            }
            rotation.set(1, last);
        }
    }

    // ─────────────────────────────────────────────
    // ELIMINATORIAS: Knockout Bracket Generator (unchanged)
    // ─────────────────────────────────────────────

    private void generateKnockoutBracket(Tournament tournament, List<Team> teams) {
        int nbTeams = teams.size();
        int totalRounds = (int) (Math.log(nbTeams) / Math.log(2));

        List<List<TournamentMatch>> roundsMatches = new ArrayList<>();

        for (int r = 0; r < totalRounds; r++) {
            int matchesInRound = nbTeams / (int) Math.pow(2, r + 1);
            List<TournamentMatch> round = new ArrayList<>();
            String roundName = getRoundName(matchesInRound);

            for (int i = 0; i < matchesInRound; i++) {
                TournamentMatch m = new TournamentMatch();
                m.setTournament(tournament);
                m.setRound(roundName);
                m.setMatchIndex(i);
                round.add(m);
            }
            roundsMatches.add(round);
        }

        for (int r = totalRounds - 1; r >= 0; r--) {
            List<TournamentMatch> currentRound = roundsMatches.get(r);
            List<TournamentMatch> nextRound = (r < totalRounds - 1) ? roundsMatches.get(r + 1) : null;

            for (int i = 0; i < currentRound.size(); i++) {
                TournamentMatch m = currentRound.get(i);

                if (nextRound != null) {
                    m.setNextMatch(nextRound.get(i / 2));
                }

                if (r == 0) {
                    m.setTeamA(teams.get(i * 2));
                    m.setTeamB(teams.get(i * 2 + 1));
                    m.setStatus("PLAYING");
                }

                m = matchRepository.save(m);
                currentRound.set(i, m);
            }
        }
    }

    private String getRoundName(int matchesInRound) {
        if (matchesInRound == 1) return "FINAL";
        if (matchesInRound == 2) return "SEMIFINAL";
        if (matchesInRound == 4) return "QUARTERFINAL";
        return "ROUND_" + (matchesInRound * 2);
    }

    // ─────────────────────────────────────────────
    // Update Result (works for both modes)
    // ─────────────────────────────────────────────

    @Transactional
    public TournamentMatch updateMatchResult(Long matchId, int scoreA, int scoreB) {
        TournamentMatch match = matchRepository.findById(matchId).orElseThrow();
        Tournament tournament = match.getTournament();

        match.setScoreA(scoreA);
        match.setScoreB(scoreB);
        match.setStatus("FINISHED");

        if ("LIGA".equalsIgnoreCase(tournament.getType())) {
            // In league mode, no winner advancement needed
            matchRepository.save(match);
            recalculateStandings(tournament);
            return match;
        }

        // Knockout: advance winner
        Team winner = (scoreA > scoreB) ? match.getTeamA() : match.getTeamB();
        match.setWinner(winner);

        if (match.getNextMatch() != null) {
            TournamentMatch next = match.getNextMatch();
            if (next.getTeamA() == null) {
                next.setTeamA(winner);
            } else {
                next.setTeamB(winner);
                next.setStatus("PLAYING");
            }
            matchRepository.save(next);
        } else {
            tournament.setStatus("FINISHED");
            tournamentRepository.save(tournament);
        }

        return matchRepository.save(match);
    }

    // ─────────────────────────────────────────────
    // LIGA: Recalculate Standings from scratch
    // ─────────────────────────────────────────────

    @Transactional
    public void recalculateStandings(Tournament tournament) {
        List<LeagueStanding> standings = standingRepository.findByTournament(tournament);

        // Reset all standings
        for (LeagueStanding s : standings) {
            s.setPoints(0);
            s.setPlayed(0);
            s.setWon(0);
            s.setDrawn(0);
            s.setLost(0);
            s.setGoalsFor(0);
            s.setGoalsAgainst(0);
        }

        // Get all finished matches
        List<TournamentMatch> matches = matchRepository.findByTournament(tournament);

        for (TournamentMatch m : matches) {
            if (!"FINISHED".equals(m.getStatus())) continue;
            if (m.getScoreA() == null || m.getScoreB() == null) continue;
            if (m.getTeamA() == null || m.getTeamB() == null) continue;

            int sA = m.getScoreA();
            int sB = m.getScoreB();

            Optional<LeagueStanding> standA = standingRepository.findByTournamentAndTeam(tournament, m.getTeamA());
            Optional<LeagueStanding> standB = standingRepository.findByTournamentAndTeam(tournament, m.getTeamB());

            if (standA.isEmpty() || standB.isEmpty()) continue;

            LeagueStanding a = standA.get();
            LeagueStanding b = standB.get();

            a.setPlayed(a.getPlayed() + 1);
            b.setPlayed(b.getPlayed() + 1);
            a.setGoalsFor(a.getGoalsFor() + sA);
            a.setGoalsAgainst(a.getGoalsAgainst() + sB);
            b.setGoalsFor(b.getGoalsFor() + sB);
            b.setGoalsAgainst(b.getGoalsAgainst() + sA);

            if (sA > sB) {
                a.setWon(a.getWon() + 1);
                a.setPoints(a.getPoints() + 3);
                b.setLost(b.getLost() + 1);
            } else if (sB > sA) {
                b.setWon(b.getWon() + 1);
                b.setPoints(b.getPoints() + 3);
                a.setLost(a.getLost() + 1);
            } else {
                a.setDrawn(a.getDrawn() + 1);
                a.setPoints(a.getPoints() + 1);
                b.setDrawn(b.getDrawn() + 1);
                b.setPoints(b.getPoints() + 1);
            }
        }

        standingRepository.saveAll(standings);
    }

    // ─────────────────────────────────────────────
    // Query helpers for Controller
    // ─────────────────────────────────────────────

    public List<LeagueStanding> getStandings(Long tournamentId) {
        Tournament t = getTournament(tournamentId);
        return standingRepository.findByTournamentOrderByPointsDescGoalsForDesc(t);
    }

    public List<TournamentMatch> getMatchesByMatchday(Long tournamentId) {
        Tournament t = getTournament(tournamentId);
        return matchRepository.findByTournamentOrderByMatchdayAscMatchIndexAsc(t);
    }
}
