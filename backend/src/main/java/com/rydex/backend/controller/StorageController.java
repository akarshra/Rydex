package com.rydex.backend.controller;

import java.util.Map;
import java.util.UUID;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/storage")
public class StorageController {

  @PostMapping("/sign-upload")
  public Map<String, Object> signUpload(@RequestBody Map<String, Object> payload) {
    return Map.of(
      "success", true,
      "uploadUrl", "https://storage.supabase.co/upload/" + UUID.randomUUID(),
      "publicUrl", "https://storage.supabase.co/public/" + UUID.randomUUID()
    );
  }

  @PostMapping("/kyc/upload")
  public Map<String, Object> uploadKyc(@RequestBody Map<String, Object> payload) {
    return Map.of("success", true, "documentUrl", payload.getOrDefault("fileUrl", ""));
  }
}
