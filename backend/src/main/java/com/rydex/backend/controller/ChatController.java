package com.rydex.backend.controller;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

  @PostMapping("/send")
  public Map<String, Object> send(@RequestBody Map<String, Object> payload) {
    return Map.of(
      "success", true,
      "message", Map.of(
        "_id", UUID.randomUUID().toString(),
        "rideId", payload.get("rideId"),
        "text", payload.get("text"),
        "sender", payload.get("sender"),
        "createdAt", Instant.now().toString()
      )
    );
  }

  @PostMapping("/get-all")
  public Map<String, Object> getAll(@RequestBody Map<String, Object> payload) {
    return Map.of("success", true, "messages", List.of());
  }
}
