package com.pachangapp.models;

import jakarta.persistence.*;

@Entity
@Table(name = "tournament_matches")
public class TournamentMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @ManyToOne
    @JoinColumn(name = "team_a_id")
    private Team teamA;

    @ManyToOne
    @JoinColumn(name = "team_b_id")
    private Team teamB;

    private Integer scoreA;
    private Integer scoreB;

    // "FINAL", "SEMIFINAL", "QUARTERFINAL", "ROUND_16", etc.
    private String round;

    private int matchIndex; 
    
    // Liga: número de jornada (1, 2, 3...). Null para eliminatorias.
    private Integer matchday;

    @ManyToOne
    @JoinColumn(name = "next_match_id")
    private TournamentMatch nextMatch;

    @ManyToOne
    @JoinColumn(name = "winner_id")
    private Team winner;
    
    private String status = "PENDING"; // PENDING, PLAYING, FINISHED

    public TournamentMatch() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Tournament getTournament() { return tournament; }
    public void setTournament(Tournament tournament) { this.tournament = tournament; }

    public Team getTeamA() { return teamA; }
    public void setTeamA(Team teamA) { this.teamA = teamA; }

    public Team getTeamB() { return teamB; }
    public void setTeamB(Team teamB) { this.teamB = teamB; }

    public Integer getScoreA() { return scoreA; }
    public void setScoreA(Integer scoreA) { this.scoreA = scoreA; }

    public Integer getScoreB() { return scoreB; }
    public void setScoreB(Integer scoreB) { this.scoreB = scoreB; }

    public String getRound() { return round; }
    public void setRound(String round) { this.round = round; }

    public int getMatchIndex() { return matchIndex; }
    public void setMatchIndex(int matchIndex) { this.matchIndex = matchIndex; }

    public Integer getMatchday() { return matchday; }
    public void setMatchday(Integer matchday) { this.matchday = matchday; }

    public TournamentMatch getNextMatch() { return nextMatch; }
    public void setNextMatch(TournamentMatch nextMatch) { this.nextMatch = nextMatch; }

    public Team getWinner() { return winner; }
    public void setWinner(Team winner) { this.winner = winner; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
