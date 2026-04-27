package com.pachangapp.services;

import com.pachangapp.models.Team;
import com.pachangapp.models.Tournament;
import com.pachangapp.models.TournamentMatch;
import com.pachangapp.models.User;
import com.pachangapp.repositories.TeamRepository;
import com.pachangapp.repositories.TournamentMatchRepository;
import com.pachangapp.repositories.TournamentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class TournamentService {

    @Autowired
    private TournamentRepository tournamentRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private TournamentMatchRepository matchRepository;

    public List<Tournament> getAllTournaments() {
        return tournamentRepository.findAll();
    }

    public Tournament getTournament(Long id) {
        return tournamentRepository.findById(id).orElseThrow(() -> new RuntimeException("Tournament not found"));
    }

    public Tournament createTournament(Tournament tournament) {
        return tournamentRepository.save(tournament);
    }

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

        Team team = new Team();
        team.setTournament(tournament);
        team.setName(teamName);
        team.setCreator(creator);
        team.getPlayers().addAll(players);
        
        // Ensure creator is in the team
        if (creator != null && !team.getPlayers().contains(creator)) {
            team.getPlayers().add(creator);
        }

        Team savedTeam = teamRepository.save(team);
        currentTeams++;

        // Auto-start logic when max teams reached
        if (currentTeams == tournament.getMaxTeams()) {
            startTournament(tournament);
        }

        return savedTeam;
    }

    private void startTournament(Tournament tournament) {
        tournament.setStatus("IN_PROGRESS");
        tournamentRepository.save(tournament);

        List<Team> teams = teamRepository.findByTournament(tournament);
        Collections.shuffle(teams); // Randomize seeds

        generateKnockoutBracket(tournament, teams);
    }

    private void generateKnockoutBracket(Tournament tournament, List<Team> teams) {
        int nbTeams = teams.size();
        // Fallback or padding logic should ideally exist for non power-of-2 sizes.
        // We will assume maxTeams is enforced as 4, 8, 16 etc in the frontend.
        int totalRounds = (int) (Math.log(nbTeams) / Math.log(2));

        List<List<TournamentMatch>> roundsMatches = new ArrayList<>();

        // Create empty matches level by level (Leaves = Quarters, then Semis, then Final)
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

        // Save from Final back down to Leaves, injecting nextMatch reference
        for (int r = totalRounds - 1; r >= 0; r--) {
            List<TournamentMatch> currentRound = roundsMatches.get(r);
            List<TournamentMatch> nextRound = null;
            if (r < totalRounds - 1) {
                nextRound = roundsMatches.get(r + 1);
            }

            for (int i = 0; i < currentRound.size(); i++) {
                TournamentMatch m = currentRound.get(i);
                
                if (nextRound != null) {
                    m.setNextMatch(nextRound.get(i / 2));
                }

                // If first round, assign teams
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
    
    @Transactional
    public TournamentMatch updateMatchResult(Long matchId, int scoreA, int scoreB) {
        TournamentMatch match = matchRepository.findById(matchId).orElseThrow();
        
        if ("FINISHED".equals(match.getStatus())) {
            throw new RuntimeException("Match already finished");
        }
        
        match.setScoreA(scoreA);
        match.setScoreB(scoreB);
        match.setStatus("FINISHED");
        
        Team winner = (scoreA > scoreB) ? match.getTeamA() : match.getTeamB();
        // In reality, handle ties (e.g. penalties) but we assume simple > logic for now.
        match.setWinner(winner);
        
        // Advance to next match if not final
        if (match.getNextMatch() != null) {
            TournamentMatch next = match.getNextMatch();
            if (next.getTeamA() == null) {
                next.setTeamA(winner);
            } else {
                next.setTeamB(winner);
                next.setStatus("PLAYING"); 
                // Both teams arrived, we can declare the match is ready to be played.
            }
            matchRepository.save(next);
        } else {
            // It was the final match
            Tournament tournament = match.getTournament();
            tournament.setStatus("FINISHED");
            tournamentRepository.save(tournament);
        }
        
        return matchRepository.save(match);
    }
}
