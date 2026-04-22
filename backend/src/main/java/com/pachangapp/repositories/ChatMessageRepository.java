package com.pachangapp.repositories;

import com.pachangapp.models.ChatMessage;
import com.pachangapp.models.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByTournamentOrderByTimestampAsc(Tournament tournament);
}
