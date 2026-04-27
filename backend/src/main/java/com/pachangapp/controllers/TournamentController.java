package com.pachangapp.controllers;

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
        return null; // Handle according to your security setup
    }

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
        // Fallback for dev if no auth context
        if(creator == null) {
            creator = userRepository.findById(1L).orElse(null); 
        }
        tournament.setCreator(creator);
        return ResponseEntity.ok(tournamentService.createTournament(tournament));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Team> joinTournament(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        User user = getAuthenticatedUser();
        if(user == null) {
            user = userRepository.findById(1L).orElse(null);
        }
        
        String teamName = (String) body.get("name");
        // For simplicity we just use the creator as the only player for testing right now. 
        // Real implementation would extract player IDs from body.get("players")
        List<User> players = List.of(); 
        
        return ResponseEntity.ok(tournamentService.joinTournament(id, teamName, user, players));
    }

    @GetMapping("/{id}/teams")
    public ResponseEntity<List<Team>> getTournamentTeams(@PathVariable Long id) {
        Tournament t = tournamentService.getTournament(id);
        return ResponseEntity.ok(teamRepository.findByTournament(t));
    }

    @GetMapping("/{id}/matches")
    public ResponseEntity<List<TournamentMatch>> getTournamentMatches(@PathVariable Long id) {
        Tournament t = tournamentService.getTournament(id);
        return ResponseEntity.ok(matchRepository.findByTournamentOrderByRoundDescMatchIndexAsc(t));
    }

    @PostMapping("/matches/{matchId}/result")
    public ResponseEntity<TournamentMatch> updateMatchResult(@PathVariable Long matchId, @RequestBody Map<String, Integer> score) {
        // Normally check if user is admin or tournament creator
        int scoreA = score.getOrDefault("scoreA", 0);
        int scoreB = score.getOrDefault("scoreB", 0);
        
        return ResponseEntity.ok(tournamentService.updateMatchResult(matchId, scoreA, scoreB));
    }
}
