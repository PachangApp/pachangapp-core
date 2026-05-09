package com.pachangapp.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "league_standings")
public class LeagueStanding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tournament_id", nullable = false)
    @JsonIgnoreProperties({"creator", "description", "imageUrl"})
    private Tournament tournament;

    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    @JsonIgnoreProperties({"tournament", "players", "creator"})
    private Team team;

    private int points = 0;
    private int played = 0;
    private int won = 0;
    private int drawn = 0;
    private int lost = 0;
    private int goalsFor = 0;
    private int goalsAgainst = 0;

    public LeagueStanding() {}

    public int getGoalDifference() {
        return goalsFor - goalsAgainst;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Tournament getTournament() { return tournament; }
    public void setTournament(Tournament tournament) { this.tournament = tournament; }

    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }

    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }

    public int getPlayed() { return played; }
    public void setPlayed(int played) { this.played = played; }

    public int getWon() { return won; }
    public void setWon(int won) { this.won = won; }

    public int getDrawn() { return drawn; }
    public void setDrawn(int drawn) { this.drawn = drawn; }

    public int getLost() { return lost; }
    public void setLost(int lost) { this.lost = lost; }

    public int getGoalsFor() { return goalsFor; }
    public void setGoalsFor(int goalsFor) { this.goalsFor = goalsFor; }

    public int getGoalsAgainst() { return goalsAgainst; }
    public void setGoalsAgainst(int goalsAgainst) { this.goalsAgainst = goalsAgainst; }
}
