package com.pachangapp.controllers;

import com.pachangapp.models.ChatMessage;
import com.pachangapp.models.Tournament;
import com.pachangapp.models.User;
import com.pachangapp.repositories.ChatMessageRepository;
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
@RequestMapping("/api/tournaments/{id}/chat")
public class TournamentChatController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private TournamentService tournamentService;
    
    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            return userRepository.findByUsername(auth.getName()).orElse(null);
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<List<ChatMessage>> getMessages(@PathVariable Long id) {
        Tournament t = tournamentService.getTournament(id);
        return ResponseEntity.ok(chatMessageRepository.findByTournamentOrderByTimestampAsc(t));
    }

    @PostMapping
    public ResponseEntity<ChatMessage> sendMessage(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Tournament t = tournamentService.getTournament(id);
        User sender = getAuthenticatedUser();
        // Fallback for dev testing
        if (sender == null) {
            sender = userRepository.findById(1L).orElseThrow();
        }
        
        ChatMessage msg = new ChatMessage();
        msg.setTournament(t);
        msg.setSender(sender);
        msg.setContent(body.get("content"));
        
        return ResponseEntity.ok(chatMessageRepository.save(msg));
    }
}
