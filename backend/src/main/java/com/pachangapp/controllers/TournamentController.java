package com.pachangapp.controllers;

import com.pachangapp.models.LeagueStanding;
import com.pachangapp.models.Team;
import com.pachangapp.models.Tournament;
import com.pachangapp.models.TournamentMatch;
import com.pachangapp.models.User;
import com.pachangapp.repositories.TeamRepository;
import com.pachangapp.repositories.TournamentMatchRepository;
import com.pachangapp.repositories.UserRepository;
import com.pachangapp.services.TournamentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tournaments")
public class TournamentController {

    @Autowired
    private TournamentService tournamentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private TournamentMatchRepository matchRepository;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            return userRepository.findByUsername(auth.getName()).orElse(null);
        }
        return null;
    }

    // ── General ──────────────────────────────────

    @GetMapping
    public ResponseEntity<List<Tournament>> getAllTournaments() {
        return ResponseEntity.ok(tournamentService.getAllTournaments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tournament> getTournament(@PathVariable Long id) {
        return ResponseEntity.ok(tournamentService.getTournament(id));
    }

    @PostMapping
    public ResponseEntity<Tournament> createTournament(@RequestBody Tournament tournament) {
        User creator = getAuthenticatedUser();
        if (creator == null) {
            creator = userRepository.findById(1L).orElse(null);
        }
        tournament.setCreator(creator);
        return ResponseEntity.ok(tournamentService.createTournament(tournament));
    }

    // ── Teams ─────────────────────────────────────

    @PostMapping("/{id}/join")
    public ResponseEntity<Team> joinTournament(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        User user = getAuthenticatedUser();
        if (user == null) {
            user = userRepository.findById(1L).orElse(null);
        }
        String teamName = (String) body.get("name");
        List<User> players = List.of();
        return ResponseEntity.ok(tournamentService.joinTournament(id, teamName, user, players));
    }

    @GetMapping("/{id}/teams")
    public ResponseEntity<List<Team>> getTournamentTeams(@PathVariable Long id) {
        Tournament t = tournamentService.getTournament(id);
        return ResponseEntity.ok(teamRepository.findByTournament(t));
    }

    // ── Matches (Bracket / Eliminatorias) ─────────

    @GetMapping("/{id}/matches")
    public ResponseEntity<List<TournamentMatch>> getTournamentMatches(@PathVariable Long id) {
        Tournament t = tournamentService.getTournament(id);
        return ResponseEntity.ok(matchRepository.findByTournamentOrderByRoundDescMatchIndexAsc(t));
    }

    // ── Liga: Matchdays ───────────────────────────

    @GetMapping("/{id}/matchdays")
    public ResponseEntity<List<TournamentMatch>> getMatchdays(@PathVariable Long id) {
        return ResponseEntity.ok(tournamentService.getMatchesByMatchday(id));
    }

    // ── Liga: Standings ───────────────────────────

    @GetMapping("/{id}/standings")
    public ResponseEntity<List<LeagueStanding>> getStandings(@PathVariable Long id) {
        return ResponseEntity.ok(tournamentService.getStandings(id));
    }

    // ── Result (shared: Liga + Eliminatorias) ─────

    @PostMapping("/matches/{matchId}/result")
    public ResponseEntity<TournamentMatch> updateMatchResult(
            @PathVariable Long matchId,
            @RequestBody Map<String, Integer> score) {
        int scoreA = score.getOrDefault("scoreA", 0);
        int scoreB = score.getOrDefault("scoreB", 0);
        return ResponseEntity.ok(tournamentService.updateMatchResult(matchId, scoreA, scoreB));
    }
}
